import { readFileSync } from 'node:fs'
import { Duplex } from 'node:stream'
import http from 'node:http'
import https from 'node:https'
import http2 from 'node:http2'
import path from 'node:path'

import {
  NODE_ENV,
  ORIGIN,
  PORT,
  SECURITY,
  SPOT_TERMINATION_NOTICE_TIME,
  TLS,
  USE_HTTP2
} from './config.ts'

import type { IServiceHandler, IRequest, IResponse} from './infrastructure/ports/IServiceHandler.ts'
import { type IHTTPServer, type IServer, type ISecureServer, ExitStatus } from './infrastructure/ports/IHTTPServer.ts'

import gracefulShutdown from './infrastructure/services/gracefulShutdown.ts'

export default class HttpServer implements IHTTPServer {
  private readonly protocols: IProtocols
  private readonly props: IProps
  private readonly server: IServer
  private readonly secureServer?: ISecureServer
  private readonly connections = new Set<Duplex>()

  constructor(
    protocols: IProtocols,
    props: IProps = {
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
  ) {
    this.protocols = protocols
    this.props = props

    if (
      protocols.gRPC &&
      (
        !this.props.useHttp2 ||
        !(
          this.props.tls.certPath && this.props.tls.certPath.trim() &&
          this.props.tls.keyPath && this.props.tls.keyPath.trim()
        )
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
      if (this.props.nodeEnv !== 'production') {
        console.warn('Secure Server closed')
      }

      if (this.server.listening) {
        this.server.close()
      }
    })
    this.server.prependOnceListener('close', () => {
      if (this.props.nodeEnv !== 'production') {
        console.warn('Server closed')
      }

      if (this.secureServer?.listening) {
        this.secureServer.close()
      }
    })

    process.prependOnceListener('SIGINT', signal => this.shutdown(signal))
    process.prependOnceListener('SIGTERM', signal => this.shutdown(signal))
    process.prependOnceListener('SIGQUIT', signal => this.shutdown(signal))
  }

  async connectionsCount() {
    /*const server = this.secureServer ?? this.server

    return new Promise<number>((resolve, reject) => {
      server.getConnections((err, count) => {
        if (err) {
          return reject(err)
        }

        resolve(count)
      })
    })*/

    return this.connections.size
  }

  start() {
    return Promise.all([
      new Promise<void>((resolve, reject) => {
        this.secureServer?.listen(this.props.port.https, () => {
          if (this.props.nodeEnv !== 'production') {
            console.info(`Server http${this.props.useHttp2 ? '/2' : 's/1.1'}`, `listening on port ${this.props.port.https}`)
          }

          resolve()
        })

        this.secureServer?.prependOnceListener('error', reject)
      }),
      new Promise<void>((resolve, reject) => {
        this.server.listen(this.props.port.http, () => {
          if (this.props.nodeEnv !== 'production') {
            if (
              this.props.tls.certPath && this.props.tls.certPath.trim() &&
              this.props.tls.keyPath && this.props.tls.keyPath.trim()
            ) {
              console.info(`Server http/1.1`, `listening on port ${this.props.port.http} to redirect to port ${this.props.port.https}`)
            } else {
              console.info(`Server http/1.1`, `listening on port ${this.props.port.http}`)
            }
          }
    
          resolve()
        })
    
        this.server.prependOnceListener('error', reject)
      })
    ]).then(() => this)
  }

  stop() {
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
    } else if (this.server.listening) {
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

    return Promise.resolve()
  }

  private createSecureServer(): ISecureServer | undefined {
    if (
      this.props.tls.certPath && this.props.tls.certPath.trim() &&
      this.props.tls.keyPath && this.props.tls.keyPath.trim()
    ) {
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
      if (
        (
          !req.method ||
          req.method.toUpperCase() === 'GET' ||
          req.method.toUpperCase() === 'HEAD'
        ) &&
        req.url?.toLowerCase() === '/health'
      ) {
        res.writeHead(200, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'false',
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json'
        })
        return res.end(JSON.stringify({
          message: 'OK'
        }))
      } else if (
        (
          this.props.tls.certPath && this.props.tls.certPath.trim() &&
          this.props.tls.keyPath && this.props.tls.keyPath.trim()
        ) &&
        !encrypted
      ) {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections
        res.writeHead(308, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'false',
          'Cache-Control': 'immutable',
          'Content-Type': 'application/json',
          Location: new URL(req.url ?? '/', this.props.origin.api.origin).toString()
        })
        return res.end(JSON.stringify({
          type: 'about:blank',
          status: 308,
          title: 'Permanent Redirect',
          detail: 'The requested resource has been permanently moved to another location',
          instance: req.url
        }))
      } else if (req.url?.toLowerCase()?.startsWith('/graphql') && this.protocols.GraphQL) {
        if (!this.protocols.GraphQL) {
          res.writeHead(501, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'false',
            'Cache-Control': 'no-store',
            'Content-Type': 'application/json'
          })
          return res.end(JSON.stringify({
            type: 'about:blank',
            status: 501,
            title: 'Not Implemented',
            detail: 'The server does not support the functionality required to fulfill the request',
            instance: req.url
          }))
        }

        return this.protocols.GraphQL.handler(req, res)
      } else if (req.url?.toLowerCase()?.startsWith('/grpc') && this.protocols.gRPC) {
        if (!this.protocols.gRPC) {
          res.writeHead(501, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'false',
            'Cache-Control': 'no-store',
            'Content-Type': 'application/json'
          })
          return res.end(JSON.stringify({
            type: 'about:blank',
            status: 501,
            title: 'Not Implemented',
            detail: 'The server does not support the functionality required to fulfill the request',
            instance: req.url
          }))
        }

        return this.protocols.gRPC.handler(req, res)
      } else if (req.url?.toLowerCase()?.startsWith('/soap') && this.protocols.SOAP) {
        if (!this.protocols.SOAP) {
          res.writeHead(501, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'false',
            'Cache-Control': 'no-store',
            'Content-Type': 'application/json'
          })
          return res.end(JSON.stringify({
            type: 'about:blank',
            status: 501,
            title: 'Not Implemented',
            detail: 'The server does not support the functionality required to fulfill the request',
            instance: req.url
          }))
        }

        return this.protocols.SOAP.handler(req, res)
      }
  
      this.protocols.REST.handler(req, res)
    }
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

  private async shutdown(signal: NodeJS.Signals) {
    if (this.props.nodeEnv !== 'production') {
      console.warn(`Received ${signal}, forcefully shutting down`)
    }

    const forceExit = setTimeout(() => {
      if (this.connections.size > 0) {
        if (this.props.nodeEnv !== 'production') {
          console.error('Could not close connections in time, forcefully shutting down')
        }
        
        process.exit(ExitStatus.FAILURE)
      }
    }, this.props.spotTerminationNoticeTime)

    this.stop().then(() => {
      if (this.connections.size === 0) {
        clearTimeout(forceExit)
      }

      process.exit(ExitStatus.SUCCESS)
    })

    await gracefulShutdown(signal)
  }
}

export interface IProtocols {
  REST: IServiceHandler,
  GraphQL?: IServiceHandler,
  gRPC?: IServiceHandler,
  SOAP?: IServiceHandler
}

export type IProps = {
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