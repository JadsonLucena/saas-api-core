import Name from '../VO/Name.js'

import Entity from './Entity.js'

export default class OauthProvider extends Entity {
  #name: Name
  #picture?: URL
  #clientId: string
  #clientSecret: string
  #updatedAt: Date
  #disabledAt?: Date

  constructor ({
    name,
    picture,
    clientId,
    clientSecret
  }: {
    name: Name,
    picture?: URL,
    clientId: string,
    clientSecret: string
  }) {
    super()

    this.name = name
    this.picture = picture
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.#updatedAt = this.createdAt
  }

  set name (name: Name) {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    } else if (!(name instanceof Name)) {
      throw new TypeError('Invalid name')
    }

    this.#name = name
    this.#updatedAt = new Date()
  }

  get name () {
    return this.#name
  }

  set picture (picture: URL | undefined) {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    } else if (!(picture instanceof URL) && typeof picture !== 'undefined') {
      throw new TypeError('Invalid picture')
    }

    this.#picture = picture
    this.#updatedAt = new Date()
  }

  get picture () {
    return this.#picture
  }

  set clientId (clientId: string) {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    } else if (typeof clientId !== 'string' || !clientId) {
      throw new TypeError('Invalid clientId')
    }

    this.#clientId = clientId
    this.#updatedAt = new Date()
  }

  get clientId () {
    return this.#clientId
  }

  set clientSecret (clientSecret: string) {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    } else if (typeof clientSecret !== 'string' || !clientSecret) {
      throw new TypeError('Invalid clientSecret')
    }

    this.#clientSecret = clientSecret
    this.#updatedAt = new Date()
  }

  get clientSecret () {
    return this.#clientSecret
  }

  get updatedAt () {
    return this.#updatedAt
  }

  get disabledAt () {
    return this.#disabledAt
  }

  disable () {
    if (this.#disabledAt) {
      throw new Error('It\'s already disabled')
    }

    this.#updatedAt = this.#disabledAt = new Date()

    return this
  }

  enable () {
    if (!this.#disabledAt) {
      throw new Error('It\'s already enabled')
    }

    this.#disabledAt = undefined
    this.#updatedAt = new Date()

    return this
  }
}
