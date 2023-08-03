import { isUndefined, isDate, isURL, isToken } from '../service/TypeGuard.js'

import UUID from '../VO/UUID.js'
import Email from '../VO/Email.js'
import Name from '../VO/Name.js'

import Entity from './AbstractEntity.js'
import OauthProvider from './OauthProvider.js'

export default class Oauth extends Entity {
  #provider: OauthProvider
  #name: Name
  #username: Email
  #picture?: URL
  #accessToken: string
  #expiresIn: Date
  #refreshToken: string
  #refreshTokenExpiresIn?: Date
  #updatedAt: Date
  #disabledAt?: Date

  constructor ({
    id,
    provider,
    name,
    username,
    picture,
    accessToken,
    expiresIn,
    refreshToken,
    refreshTokenExpiresIn,
    createdAt,
    updatedAt,
    disabledAt
  }: {
    id?: UUID,
    provider: OauthProvider,
    name: Name,
    username: Email,
    picture?: URL,
    accessToken: string,
    expiresIn: Date,
    refreshToken: string,
    refreshTokenExpiresIn?: Date,
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
    if (!isDate(disabledAt) && !isUndefined(disabledAt)) {
      throw new TypeError('Invalid disabledAt')
    }
    if (!isDate(updatedAt) && !isUndefined(updatedAt)) {
      throw new TypeError('Invalid updatedAt')
    }

    this.#provider = provider
    this.name = name
    this.#username = username
    this.picture = picture
    this.accessToken = accessToken
    this.expiresIn = expiresIn
    this.refreshToken = refreshToken
    this.refreshTokenExpiresIn = refreshTokenExpiresIn
    this.#disabledAt = disabledAt
    this.#updatedAt = updatedAt ?? this.createdAt
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
    } else if (!isURL(picture) && !isUndefined(picture)) {
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
    } else if (!isToken(accessToken) || !accessToken) {
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
    } else if (!isToken(refreshToken) || !refreshToken) {
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
      !isDate(expiresIn) ||
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

  set refreshTokenExpiresIn (refreshTokenExpiresIn: Date | undefined) {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    } else if (
      (!isDate(refreshTokenExpiresIn) || refreshTokenExpiresIn.getTime() <= Date.now()) &&
      !isUndefined(refreshTokenExpiresIn)
    ) {
      throw new TypeError('Invalid refreshTokenExpiresIn')
    }

    this.#refreshTokenExpiresIn = refreshTokenExpiresIn
    this.#updatedAt = new Date()
  }

  get refreshTokenExpiresIn () {
    return this.#refreshTokenExpiresIn
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
