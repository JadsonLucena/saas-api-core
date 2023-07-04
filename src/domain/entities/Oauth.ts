import UUID from '../VO/UUID.js'
import Email from '../VO/Email.js'
import Name from '../VO/Name.js'

import Entity from './Entity.js'
import OauthProvider from './OauthProvider.js'

export default class Oauth extends Entity {
  #provider: OauthProvider
  #name: Name
  #username: Email
  #picture?: URL
  #accessToken: string
  #refreshToken: string
  #expiresIn: Date
  #updatedAt: Date
  #disabledAt?: Date

  constructor ({
    provider,
    id,
    name,
    username,
    picture,
    accessToken,
    refreshToken,
    expiresIn,
    createdAt,
    updatedAt = new Date(),
    disabledAt
  }: {
    provider: OauthProvider,
    id?: UUID,
    name: Name,
    username: Email,
    picture?: URL,
    accessToken: string,
    refreshToken: string,
    expiresIn: Date,
    createdAt?: Date,
    updatedAt?: Date,
    disabledAt?: Date
  }) {
    super({
      id,
      createdAt
    })

    if (!(provider instanceof OauthProvider) || !provider) {
      throw new TypeError('Invalid provider')
    }
    if (!(username instanceof Email) || !username) {
      throw new TypeError('Invalid username')
    }

    this.#provider = provider
    this.name = name
    this.#username = username
    this.picture = picture
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    this.expiresIn = expiresIn
    this.updatedAt = updatedAt
    this.disabledAt = disabledAt
  }

  get provider () {
    return this.#provider
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

  get username () {
    return this.#username
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

  set accessToken (accessToken: string) {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    } else if (typeof accessToken !== 'string' || !accessToken) {
      throw new TypeError('Invalid accessToken')
    }

    this.#accessToken = accessToken
    this.#updatedAt = new Date()
  }

  get accessToken () {
    return this.#accessToken
  }

  set refreshToken (refreshToken: string) {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    } else if (typeof refreshToken !== 'string' || !refreshToken) {
      throw new TypeError('Invalid refreshToken')
    }

    this.#refreshToken = refreshToken
    this.#updatedAt = new Date()
  }

  get refreshToken () {
    return this.#refreshToken
  }

  set expiresIn (expiresIn: Date) {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    } else if (
      !(expiresIn instanceof Date) ||
      expiresIn.getTime() <= Date.now()
    ) {
      throw new TypeError('Invalid expiresIn')
    }

    this.#expiresIn = expiresIn
    this.#updatedAt = new Date()
  }

  get expiresIn () {
    return this.#expiresIn
  }

  set updatedAt (updatedAt: Date) {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    } else if (!(updatedAt instanceof Date)) {
      throw new TypeError('Invalid updatedAt')
    }

    this.#updatedAt = updatedAt
  }

  get updatedAt () {
    return this.#updatedAt
  }

  set disabledAt (disabledAt: Date | undefined) {
    if (!(disabledAt instanceof Date) && typeof disabledAt !== 'undefined') {
      throw new TypeError('Invalid disabledAt')
    } else if (this.#disabledAt && disabledAt) {
      throw new Error('It\'s already disabled')
    }

    this.#disabledAt = disabledAt
    this.#updatedAt = new Date()
  }

  get disabledAt () {
    return this.#disabledAt
  }
}
