import { readFileSync, existsSync } from 'node:fs'
import { Duplex } from 'node:stream'
import path from 'node:path'
import http from 'node:http'
import https from 'node:https'
import http2 from 'node:http2'
import cluster, { Worker } from 'node:cluster'

import {
  CLUSTER,
  NODE_ENV,
  ORIGIN,
  PORT,
  SECURITY,
  SPOT_TERMINATION_NOTICE_TIME,
  TLS,
  USE_HTTP2,
  NodeEnv
} from './config.ts'

import type { IServiceHandler, IRequest, IResponse} from './infrastructure/ports/IServiceHandler.ts'
import { type IHTTPServer, type IServer, type ISecureServer, ExitStatus } from './infrastructure/ports/IHTTPServer.ts'

import gracefulShutdown from './infrastructure/services/gracefulShutdown.ts'

const serverProps: IServerProps = {
  nodeEnv: NODE_ENV,
  useHttp2: USE_HTTP2,
  port: {
    http: PORT.HTTP,
    https: PORT.HTTPS
  },
  tls: {
    certPath: TLS.CERT_PATH,
    keyPath: TLS.KEY_PATH
  },
  security: {
    keepAliveTimeout: SECURITY.KEEP_ALIVE_TIMEOUT,
    maxExecutionTime: SECURITY.MAX_EXECUTION_TIME,
    maxConnections: SECURITY.MAX_CONNECTIONS
  },
  spotTerminationNoticeTime: SPOT_TERMINATION_NOTICE_TIME,
  origin: {
    api: {
      origin: ORIGIN.API
    }
  }
}

export default class HttpServer implements IHTTPServer {
  private readonly protocols: IProtocols
  private readonly props: IServerProps
  private readonly server: IServer
  private readonly secureServer?: ISecureServer
  private readonly connections = new Set<Duplex>()

  constructor(
    protocols: IProtocols,
    props: IServerProps = serverProps
  ) {
    this.protocols = protocols
    this.props = props

    if (
      protocols.gRPC &&
      (
        !this.props.useHttp2 ||
        !this.hasValidTLS()
      )
    ) {
      throw new Error('gRPC requires HTTP2 and TLS')
    }

    this.secureServer = this.createSecureServer()
    if (this.secureServer) {
      this.secureServer.setTimeout(this.props.security.maxExecutionTime)
      this.secureServer.maxConnections = this.props.security.maxConnections
    }

    this.server = this.createServer()
    this.server.setTimeout(this.props.security.maxExecutionTime)
    this.server.maxConnections = this.props.security.maxConnections

    const server = this.secureServer ?? this.server
    server.on('connection', socket => {
      this.connections.add(socket)
      socket.prependOnceListener('close', () => this.connections.delete(socket))
    })

    this.secureServer?.prependOnceListener('close', () => {
      if (this.props.nodeEnv !== NodeEnv.PRODUCTION) {
        console.warn('Secure Server closed')
      }

      if (this.server.listening) {
        this.server.close()
      }
    })
    this.server.prependOnceListener('close', () => {
      if (this.props.nodeEnv !== NodeEnv.PRODUCTION) {
        console.warn('Server closed')
      }

      if (this.secureServer?.listening) {
        this.secureServer.close()
      }
    })

    process.prependOnceListener('SIGINT', () => !cluster.workers?.length && this.stop())
    process.prependOnceListener('SIGTERM', () => !cluster.workers?.length && this.stop())
    process.prependOnceListener('SIGQUIT', () => !cluster.workers?.length && this.stop())
  }

  connectionsCount() {
    return this.connections.size
  }

  async start() {
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        this.secureServer?.listen(this.props.port.https, () => {
          if (this.props.nodeEnv !== NodeEnv.PRODUCTION) {
            console.info(`Server http${this.props.useHttp2 ? '/2' : 's/1.1'}`, `listening on port ${this.props.port.https}`)
          }

          resolve()
        })

        this.secureServer?.prependOnceListener('error', reject)
      }),
      new Promise<void>((resolve, reject) => {
        this.server.listen(this.props.port.http, () => {
          if (this.props.nodeEnv !== NodeEnv.PRODUCTION) {
            if (this.hasValidTLS()) {
              console.info(`Server http/1.1`, `listening on port ${this.props.port.http} to redirect to port ${this.props.port.https}`)
            } else {
              console.info(`Server http/1.1`, `listening on port ${this.props.port.http}`)
            }
          }
    
          resolve()
        })
    
        this.server.prependOnceListener('error', reject)
      })
    ])
  }

  async stop() {
    if (this.props.nodeEnv !== NodeEnv.PRODUCTION) {
      console.warn(`forcefully shutting down server`)
    }

    const forceExit = setTimeout(() => {
      if (this.connections.size > 0) {
        if (this.props.nodeEnv !== NodeEnv.PRODUCTION) {
          console.error('Could not close connections in time, forcefully shutting down')
        }
        
        process.exit(ExitStatus.FAILURE)
      }
    }, this.props.spotTerminationNoticeTime)

    this.close().catch(err => {
      if (this.props.nodeEnv !== NodeEnv.PRODUCTION) {
        console.error('Error during shutdown:', err)
      }

      process.exit(ExitStatus.FAILURE)
    })

    if (this.connections.size === 0) {
      clearTimeout(forceExit)
    }

    await gracefulShutdown()

    process.exit(ExitStatus.SUCCESS)
  }

  private async close() {
    if (this.secureServer?.listening) {
      return new Promise<void>((resolve, reject) => {
        this.secureServer?.close(err => {
          if (err) {
            return reject(err)
          }

          resolve()
        })

        this.drain().catch(reject)
      })
    }

    return new Promise<void>((resolve, reject) => {
      this.server.close(err => {
        if (err) {
          return reject(err)
        }

        resolve()
      })

      this.drain().catch(reject)
    })
  }

  private createSecureServer(): ISecureServer | undefined {
    if (this.hasValidTLS(this.props.tls)) {
      if (this.props.useHttp2) {
        return http2.createSecureServer({
          cert: readFileSync(path.join(path.resolve(), this.props.tls.certPath)),
          key: readFileSync(path.join(path.resolve(), this.props.tls.keyPath)),
          allowHTTP1: true,
          keepAlive: Boolean(this.props.security.keepAliveTimeout)
        }, this.requestHandler(true))
      }
  
      return https.createServer({
        cert: readFileSync(path.join(path.resolve(), this.props.tls.certPath)),
        key: readFileSync(path.join(path.resolve(), this.props.tls.keyPath)),
        keepAliveTimeout: this.props.security.keepAliveTimeout,
        keepAlive: Boolean(this.props.security.keepAliveTimeout),
        requestTimeout: this.props.security.maxExecutionTime
      }, this.requestHandler(true))
    }
  
    return undefined
  }

  private createServer(): IServer {
    if (this.props.useHttp2) {
      // https://http2.github.io/faq/#does-http2-require-encryption
      // server = http2.createServer(requestHandler)
      return http.createServer({
        keepAliveTimeout: this.props.security.keepAliveTimeout,
        keepAlive: Boolean(this.props.security.keepAliveTimeout),
        requestTimeout: this.props.security.maxExecutionTime
      }, this.requestHandler())
    }
  
    return http.createServer({
      keepAliveTimeout: this.props.security.keepAliveTimeout,
      keepAlive: Boolean(this.props.security.keepAliveTimeout),
      requestTimeout: this.props.security.maxExecutionTime
    }, this.requestHandler())
  }

  private requestHandler(encrypted: boolean = false) {
    return (req: IRequest, res: IResponse) => {
      if (this.isHealthCheck(req)) {
        return ResponseHandler.sendHealthResponse(res)
      } else if (this.shouldRedirect(encrypted)) {
        return ResponseHandler.sendRedirectResponse(res, req, this.props.origin.api.origin)
      }

      return this.routeProtocol(req, res)
    }
  }

  private routeProtocol(req: IRequest, res: IResponse) {
    const url = req.url?.toLowerCase() ?? ''

    if (url.startsWith('/graphql')) {
      if (!this.protocols.GraphQL) {
        return ResponseHandler.sendNotImplementedResponse(res, req)
      }

      return this.protocols.GraphQL.handler(req, res)
    } else if (url.startsWith('/grpc')) {
      if (!this.protocols.gRPC) {
        return ResponseHandler.sendNotImplementedResponse(res, req)
      }

      return this.protocols.gRPC.handler(req, res)
    } else if (url.startsWith('/soap')) {
      if (!this.protocols.SOAP) {
        return ResponseHandler.sendNotImplementedResponse(res, req)
      }

      return this.protocols.SOAP.handler(req, res)
    }

    return this.protocols.REST.handler(req, res)
  }

  private isHealthCheck(req: IRequest): boolean {
    return (
      (!req.method ||
       req.method.toUpperCase() === 'GET' ||
       req.method.toUpperCase() === 'HEAD') &&
      req.url?.toLowerCase() === '/health'
    )
  }

  private shouldRedirect(encrypted: boolean): boolean {
    return this.hasValidTLS() && !encrypted
  }

  private drain() {
    return Promise.all(Array.from(this.connections).map(socket => {
      return new Promise((resolve, reject) => {
        try {
          socket.end(resolve)
          setTimeout(() => socket.destroy(), 5000)
        } catch (err) {
          reject(err)
        }
      })
    }))
  }

  private hasValidTLS(tls: {
    certPath?: string,
    keyPath?: string
  } = this.props.tls): tls is { certPath: string, keyPath: string } {
    return Boolean((
      tls.certPath?.trim() &&
      tls.keyPath?.trim()
    ) && (
      existsSync(path.join(path.resolve(), tls.certPath)) &&
      existsSync(path.join(path.resolve(), tls.keyPath))
    ))
  }
}

export class HttpServerCluster implements IHTTPServer {
  private readonly protocols: IProtocols
	private readonly props: IServerClusterProps
	private readonly workers = new Set<Worker>()
  private readonly servers = new Set<HttpServer>()

  constructor(
    protocols: IProtocols,
    props: IServerClusterProps = Object.assign(serverProps, {
      numWorkers: CLUSTER.WORKERS
    })
  ) {
    this.protocols = protocols
    this.props = props

    process.prependOnceListener('SIGINT', () => this.stop())
    process.prependOnceListener('SIGTERM', signal => {
      if (this.servers.size) {
        return this.stop()
      }

      if (this.props.nodeEnv !== NodeEnv.PRODUCTION) {
        console.log(`[Primary] Received ${signal}, forcefully shutting down cluster...`)
      }

      process.exit(ExitStatus.SUCCESS)
    })
    process.prependOnceListener('SIGQUIT', () => this.stop())
  }

  connectionsCount() {
    let connections = 0

    this.servers.forEach(server => {
      connections += server.connectionsCount()
    })

    return connections
  }

  async start() {
    if (!cluster.isPrimary) {
      const server = new HttpServer(this.protocols, this.props)

      this.servers.add(server)

      return server.start()
    }

    if (this.props.nodeEnv !== NodeEnv.PRODUCTION) {
      console.log(`[Primary] ${process.pid} is running`)
    }

    for (let i = 0; i < this.props.numWorkers; i++) {
      this.workers.add(this.createWorker())
    }

    cluster.on('exit', (worker, code, signal) => {
      if (this.servers.size) {
        if (this.props.nodeEnv !== NodeEnv.PRODUCTION) {
          console.error(`[Primary] Worker ${worker.process.pid} exited with code ${code} and signal ${signal}. Restarting...`)
        }

        this.workers.delete(worker)

        this.workers.add(this.createWorker())
      }
    })
  }

	async stop() {
    this.servers.clear()

    if (cluster.isPrimary) {
      if (this.props.nodeEnv !== NodeEnv.PRODUCTION) {
        console.log(`[Primary] Closing cluster...`)
      }

      await Promise.all(Array.from(this.workers).map(worker => new Promise((resolve, reject) => {
        try {
          worker.prependOnceListener('exit', resolve)
          worker.prependOnceListener('error', reject)
          worker.kill()
        } catch (err) {
          reject(err)
        }
      }))).catch(err => {
        if (this.props.nodeEnv !== NodeEnv.PRODUCTION) {
          console.error(`[Primary] Error during shutdown:`, err)
        }

        process.exit(ExitStatus.FAILURE)
      })

      if (this.props.nodeEnv !== NodeEnv.PRODUCTION) {
        console.log(`[Primary] Cluster closed.`)
      }

      this.workers.clear()

      process.exit(ExitStatus.SUCCESS)
    }
  }

  private createWorker() {
    const worker = cluster.fork()

    worker.on('message', message => {
      if (this.props.nodeEnv !== NodeEnv.PRODUCTION) {
        console.log(`[Primary] Message from worker ${worker.process.pid}:`, message)
      }
    })

    worker.on('disconnect', () => {
      console.warn(`Worker ${worker.process.pid} disconnected`)
      worker.kill()
    })

    worker.on('error', (err) => {
      console.error(`Error in worker ${worker.process.pid}:`, err)
      worker.kill()
    })

    return worker
  }
}

class ResponseHandler {
  private static readonly CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'false'
  }

  static sendHealthResponse(res: IResponse): void {
    res.writeHead(200, {
      ...this.CORS_HEADERS,
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json'
    })
    res.end(JSON.stringify({ message: 'OK' }))
  }

  static sendRedirectResponse(res: IResponse, req: IRequest, origin: URL): void {
    console.log('sendRedirectResponse', origin)
    res.writeHead(308, {
      ...this.CORS_HEADERS,
      'Cache-Control': 'immutable',
      'Content-Type': 'application/json',
      Location: new URL(req.url ?? '/', origin).toString()
    })
    res.end(JSON.stringify({
      type: 'about:blank',
      status: 308,
      title: 'Permanent Redirect',
      detail: 'The requested resource has been permanently moved to another location',
      instance: req.url
    }))
  }

  static sendNotImplementedResponse(res: IResponse, req: IRequest): void {
    res.writeHead(501, {
      ...this.CORS_HEADERS,
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json'
    })
    res.end(JSON.stringify({
      type: 'about:blank',
      status: 501,
      title: 'Not Implemented',
      detail: 'The server does not support the functionality required to fulfill the request',
      instance: req.url
    }))
  }
}

export interface IProtocols {
  REST: IServiceHandler,
  GraphQL?: IServiceHandler,
  gRPC?: IServiceHandler,
  SOAP?: IServiceHandler
}

export type IServerProps = {
  nodeEnv: string,
  useHttp2: boolean,
  port: {
    http: number,
    https: number
  },
  tls: {
    certPath?: string,
    keyPath?: string
  },
  security: {
    keepAliveTimeout: number,
    maxExecutionTime: number,
    maxConnections: number
  },
  spotTerminationNoticeTime: number,
  origin: {
    api: {
      origin: URL
    }
  }
} 

export type IServerClusterProps = IServerProps & {
	numWorkers: number
}