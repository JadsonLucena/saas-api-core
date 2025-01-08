import {
  NODE_ENV,
  NodeEnv,
  CLUSTER
} from './config.ts'

import HttpServer, { HttpServerCluster } from './HTTPServer.ts'

import REST from './infrastructure/presenters/REST/index.ts'

const protocols = {
  REST: new REST()
}

const httpServer = CLUSTER.WORKERS === 1 ? new HttpServer(protocols) : new HttpServerCluster(protocols)

export default await httpServer.start()

// process.on('uncaughtException', (err: Error) => {
process.on('uncaughtExceptionMonitor', (err: Error) => {
  if (NODE_ENV !== NodeEnv.PRODUCTION) {
    console.warn('Uncaught Exception thrown', err)
  }
})
process.on('unhandledRejection', (reason, promise) => {
  if (NODE_ENV !== NodeEnv.PRODUCTION) {
    console.warn('Unhandled Rejection at:', promise, 'reason:', reason)
  }
})