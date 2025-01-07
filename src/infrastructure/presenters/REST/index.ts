import path from 'path'

import Fastify, { type FastifyInstance } from 'fastify'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'

import { ORIGIN, SECURITY, ASSETS } from '../../../config.ts'

import type { IServiceHandler } from '../../ports/IServiceHandler.ts'

export default class REST implements IServiceHandler {
  private readonly fastify: FastifyInstance

  constructor() {
    this.fastify = Fastify({
      bodyLimit: SECURITY.BODY_MAX_SIZE,
    })

    this.fastify.register(fastifyStatic, {
      root: path.join(path.resolve(), ASSETS.DIR_ROOT_PATH),
      prefix: `/${ASSETS.DIR_ROOT_PATH}/`,
      constraints: {
        host: ORIGIN.ASSETS.hostname
      },
      list: false
    })

    this.fastify.register(fastifyMultipart, {
      limits: {
        fieldSize: SECURITY.UPLOAD_MAX_FILESIZE
      }
    })

    this.fastify.setErrorHandler(this.errorHandler)

    if (SECURITY.PREVENT_HOTLINK) {
      this.fastify.addHook('onRequest', this.preventHotlinking)
    }

    this.fastify.head('/*', (req, res) => {
      return res.send()
    })

    this.fastify.get('/*', async (req, res) => {
      return res.send({
        message: 'Hello World'
      })
    })

    this.fastify.ready()
  }

  handler = async (req, res) => {
    this.fastify.routing(req, res)
  }

  private errorHandler = (err, req, res) => {
    console.error(err)

    // https://www.rfc-editor.org/rfc/rfc9457.html
    res.status(500).send({
      type: 'about:blank',
      status: 500,
      title: 'Internal Server Error',
      detail: err.message,
      instance: req.url
    })
  }

  private preventHotlinking(req, res, done) {
    const referer = req.headers.referer

    if (
      req.url.startsWith(`/${ASSETS.DIR_ROOT_PATH}`) &&
      (
        !referer ||
        ![
          ORIGIN.API.hostname,
          ORIGIN.GUI.hostname
        ].some(allowed => new URL(referer).hostname.startsWith(allowed))
      )
    ) {
      res.status(403).send({
        type: 'about:blank',
        status: 403,
        title: 'Forbidden',
        detail: 'Access to the requested resource is forbidden',
        instance: req.url
      })
    }

    done()
  }
}