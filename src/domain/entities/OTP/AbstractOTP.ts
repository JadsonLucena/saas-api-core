import { isInteger, isString, isUndefined, isDate } from '../../service/TypeGuard.js'

import UUID from '../../VO/UUID.js'
import Password from '../../VO/Password.js'

import Entity from '../AbstractEntity.js'

export default abstract class AbstractOTP extends Entity {
  #secret: string
  #digestAlgorithm: 'sha1' | 'sha256' | 'sha512'
  #length: number
  #updatedAt: Date
  #disabledAt?: Date

  constructor ({
    id,
    secret,
    digestAlgorithm = 'sha1',
    length = 6,
    createdAt,
    updatedAt,
    disabledAt
  }: {
    id?: UUID,
    secret: string,
    digestAlgorithm?: 'sha1' | 'sha256' | 'sha512',
    length?: number,
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

    this.secret = secret
    this.digestAlgorithm = digestAlgorithm
    this.length = length
    this.#disabledAt = disabledAt
    this.updatedAt = updatedAt ?? this.createdAt
  }

  get secret () {
    return this.#secret
  }

  set secret (secret: string) {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    } else if (
      !isString(secret) ||
      !Password.verify(secret, {
        minLength: 16,
        strong: true
      })
    ) { // https://datatracker.ietf.org/doc/html/rfc4226#section-4
      throw new TypeError('Invalid secret')
    }

    this.#secret = secret
    this.#updatedAt = new Date()
  }

  get digestAlgorithm () {
    return this.#digestAlgorithm
  }

  set digestAlgorithm (digestAlgorithm: 'sha1' | 'sha256' | 'sha512') {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    } else if (
      !isString(digestAlgorithm) ||
      !['sha1', 'sha256', 'sha512'].includes(digestAlgorithm)
    ) {
      throw new TypeError('Invalid digestAlgorithm')
    }

    this.#digestAlgorithm = digestAlgorithm
    this.#updatedAt = new Date()
  }

  get length () {
    return this.#length
  }

  set length (length: number) {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    } else if (!isInteger(length) || length < 6) { // https://datatracker.ietf.org/doc/html/rfc4226#section-4
      throw new TypeError('Invalid length')
    }

    this.#length = length
    this.#updatedAt = new Date()
  }

  get updatedAt () {
    return this.#updatedAt
  }

  protected set updatedAt (updatedAt: Date) {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    } else if (!isDate(updatedAt)) {
      throw new TypeError('Invalid updatedAt')
    }

    this.#updatedAt = updatedAt
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

  abstract generate(): string
}
