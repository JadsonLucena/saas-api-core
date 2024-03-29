import { isUndefined, isDate, isURL, isToken } from '../service/TypeGuard.js'

import UUID from '../VO/UUID.js'
import Name from '../VO/Name.js'

import Entity from './AbstractEntity.js'

export default class OauthProvider extends Entity {
  #name: Name
  #picture?: URL
  #clientId: string
  #clientSecret: string
  #updatedAt: Date
  #disabledAt?: Date

  constructor ({
    id,
    name,
    picture,
    clientId,
    clientSecret,
    createdAt,
    updatedAt,
    disabledAt
  }: {
    id?: UUID,
    name: Name,
    picture?: URL,
    clientId: string,
    clientSecret: string,
    createdAt?: Date,
    updatedAt?: Date,
    disabledAt?: Date
  }) {
    super({
      id,
      createdAt
    })

    if (!isDate(disabledAt) && !isUndefined(disabledAt)) {
      throw new TypeError('Invalid disabledAt')
    }
    if (!isDate(updatedAt) && !isUndefined(updatedAt)) {
      throw new TypeError('Invalid updatedAt')
    }

    this.name = name
    this.picture = picture
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.#disabledAt = disabledAt
    this.#updatedAt = updatedAt ?? this.createdAt
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
    } else if (!isURL(picture) && !isUndefined(picture)) {
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
    } else if (!isToken(clientId) || !clientId) {
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
    } else if (!isToken(clientSecret) || !clientSecret) {
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
