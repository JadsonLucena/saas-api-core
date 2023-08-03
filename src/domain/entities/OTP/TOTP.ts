/**
 * https://datatracker.ietf.org/doc/html/rfc6238
 */

import UUID from '../../VO/UUID.js'

import { isInteger } from '../../service/TypeGuard.js'

import AbstractOTP from './AbstractOTP.js'
import HOTP from './HOTP.js'

export default class TOTP extends AbstractOTP {
  #timeWindow: number

  constructor ({
    id,
    secret,
    digestAlgorithm,
    length,
    timeWindow = 30, // https://datatracker.ietf.org/doc/html/rfc6238#section-5.2
    createdAt,
    updatedAt,
    disabledAt
  }: {
    id?: UUID,
    secret: string,
    digestAlgorithm?: 'sha1' | 'sha256' | 'sha512',
    length?: number,
    timeWindow?: number,
    createdAt?: Date,
    updatedAt?: Date,
    disabledAt?: Date
  }) {
    super({
      id,
      secret,
      digestAlgorithm,
      length,
      createdAt,
      updatedAt,
      disabledAt
    })

    this.timeWindow = timeWindow
    this.updatedAt = updatedAt ?? this.createdAt
  }

  get timeWindow () {
    return this.#timeWindow
  }

  set timeWindow (timeWindow: number) {
    if (this.disabledAt) {
      throw new Error('It\'s disabled')
    } else if (
      !isInteger(timeWindow) ||
      timeWindow < 1
    ) {
      throw new TypeError('Invalid timeWindow')
    }

    this.#timeWindow = timeWindow
    this.updatedAt = new Date()
  }

  generate () {
    const timestampInSeconds = Math.floor(Date.now() / 1000)

    const hotp = new HOTP({
      secret: this.secret,
      digestAlgorithm: this.digestAlgorithm,
      length: this.length,
      counter: Math.floor(timestampInSeconds / this.#timeWindow)
    })

    return hotp.generate()
  }
}
