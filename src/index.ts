import { NODE_ENV } from './config.ts'

import REST from './infrastructure/presenters/REST/index.ts'

/*import HttpServer from './HTTPServer.ts'

const httpServer = new HttpServer({
  REST: new REST()
})

export default await httpServer.start()*/

import { HttpServerCluster } from './HTTPServer.ts'

const httpServerCluster = new HttpServerCluster({
  REST: new REST()
})

export default await httpServerCluster.start()

// process.on('uncaughtException', (err: Error) => {
process.on('uncaughtExceptionMonitor', (err: Error) => {
  if (NODE_ENV !== 'production') {
    console.warn('Uncaught Exception thrown', err)
  }
})
process.on('unhandledRejection', (reason, promise) => {
  if (NODE_ENV !== 'production') {
    console.warn('Unhandled Rejection at:', promise, 'reason:', reason)
  }
})