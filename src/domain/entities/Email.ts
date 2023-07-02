import UUID from '../VO/UUID.js'
import EmailVO from '../VO/Email.js'

import Entity from './Entity.js'

export default class Email extends Entity {
  #value: EmailVO
  #confirmedAt?: Date
  #disabledAt?: Date

  constructor ({
    id,
    value,
    createdAt,
    confirmedAt,
    disabledAt
  }: {
    id?: UUID,
    value: EmailVO,
    createdAt?: Date,
    confirmedAt?: Date,
    disabledAt?: Date
  }) {
    super({
      id,
      createdAt
    })

    if (!(value instanceof EmailVO)) {
      throw new TypeError('Invalid value')
    }
    if (!value.parse().domain) {
      throw new TypeError('Domain required')
    }

    this.#value = value
    this.confirmedAt = confirmedAt
    this.disabledAt = disabledAt
  }

  get value () {
    return this.#value
  }

  set confirmedAt (confirmedAt: Date | undefined) {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    } else if (!(confirmedAt instanceof Date) && typeof confirmedAt !== 'undefined') {
      throw new TypeError('Invalid confirmedAt')
    } else if (this.#confirmedAt && confirmedAt) {
      throw new Error('It\'s already confirmed')
    }

    this.#confirmedAt = confirmedAt
  }

  get confirmedAt () {
    return this.#confirmedAt
  }

  set disabledAt (disabledAt: Date | undefined) {
    if (!(disabledAt instanceof Date) && typeof disabledAt !== 'undefined') {
      throw new TypeError('Invalid disabledAt')
    } else if (this.#disabledAt && disabledAt) {
      throw new Error('It\'s already disabled')
    }

    this.#disabledAt = disabledAt
  }

  get disabledAt () {
    return this.#disabledAt
  }
}
