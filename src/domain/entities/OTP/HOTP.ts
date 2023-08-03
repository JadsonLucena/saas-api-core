/**
 * https://datatracker.ietf.org/doc/html/rfc4226
 */

import crypto from 'node:crypto'

import { isInteger } from '../../service/TypeGuard.js'

import UUID from '../../VO/UUID.js'

import AbstractOTP from './AbstractOTP.js'

export default class HOTP extends AbstractOTP {
  #counter: number

  constructor ({
    id,
    secret,
    digestAlgorithm,
    length,
    counter = 0,
    createdAt,
    updatedAt,
    disabledAt
  }: {
    id?: UUID,
    secret: string,
    digestAlgorithm?: 'sha1' | 'sha256' | 'sha512',
    length?: number,
    counter?: number,
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

    this.counter = counter
    this.updatedAt = updatedAt ?? this.createdAt
  }

  get counter () {
    return this.#counter
  }

  set counter (counter: number) {
    if (this.disabledAt) {
      throw new Error('It\'s disabled')
    } else if (
      !isInteger(counter) ||
      counter < 0
    ) {
      throw new TypeError('Invalid counter')
    }

    this.#counter = counter
    this.updatedAt = new Date()
  }

  incrementCounter (): number {
    return ++this.counter
  }

  generate () {
    const counterBuffer = Buffer.alloc(8)

    // Convert the counter to an 8-byte buffer (big-endian)
    let counter = this.#counter
    for (let i = 7; i >= 0; i--) {
      counterBuffer[i] = counter & 0xff
      counter >>= 8
    }

    const hmac = crypto.createHmac(this.digestAlgorithm, this.secret)
    hmac.update(counterBuffer)

    const hmacResult = hmac.digest()

    // Calculate the offset from the last nibble (4 bits) of the HMAC result
    const offset = hmacResult[hmacResult.length - 1] & 0x0f

    // Take 4 bytes of the HMAC result from the offset and set the most significant bit to 0
    const truncatedHash = (hmacResult.readUInt32BE(offset) & 0x7fffffff).toString()

    return truncatedHash.slice(-this.length).padStart(this.length, '0')
  }
}
