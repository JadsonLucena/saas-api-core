// https://www.rfc-editor.org/rfc/rfc4122

/* Versions
 * 1 - The time-based version specified in this document
 * 2 - DCE Security version, with embedded POSIX UIDs
 * 3 - The name-based version specified in this document that uses MD5 hashing
 * 4 - The randomly or pseudo-randomly generated version specified in this document
 * 5 - The name-based version specified in this document that uses SHA-1 hashing
 * 6, 7, 8, a, b, c, d, e, f // https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format
 */

/* Variants - https://www.uuidtools.com/decode
 * 0, 1, 2, 3, 4, 5, 6, 7 - reserved (NCS backward compatible)
 * 8, 9, a, b - DCE 1.1, ISO/IEC 11578:1996
 * c, d - reserved (Microsoft GUID)
 * e - reserved (future use)
 * f - unknown / invalid. Must end with "0"
 */

// Compress: Buffer.from(Buffer.from('bacb37d0-a51f-491b-bd68-489c245b8c16'.replaceAll('-', ''), 'hex').toString('ucs2'), 'binary').toString('hex')

import crypto from 'node:crypto'

export default class UUID extends String {
  static readonly DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
  static readonly NIL = '00000000-0000-0000-0000-000000000000'
  static readonly OID = '6ba7b812-9dad-11d1-80b4-00c04fd430c8'
  static readonly URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8'
  static readonly X500 = '6ba7b814-9dad-11d1-80b4-00c04fd430c8'
  private static readonly pattern = /^\s*(?<time_low>[0-9a-f]{8})-?(?<time_mid>[0-9a-f]{4})-?(?<time_high_and_version>(?<version>[1-5])[0-9a-f]{3})-?(?<clock_seq_and_reserved>(?<variant>[0-9a-d])[0-9a-f])(?<clock_seq_low>[0-9a-f]{2})-?(?<node>[0-9a-f]{12})\s*$/i

  constructor (uuid: String | Buffer = crypto.randomUUID()) {
    if (!UUID.verify(uuid)) {
      throw new TypeError('Invalid uuid')
    }

    super(UUID.stringify(uuid))

    Object.freeze(this)
  }

  private static stringify (uuid: String | Buffer) {
    if (Buffer.isBuffer(uuid)) {
      uuid = Buffer.from(uuid).toString('hex')
    }

    uuid = uuid.normalize('NFC').replaceAll('-', '').trim()

    return `${uuid.substring(0, 8)}-${uuid.substring(8, 12)}-${uuid.substring(12, 16)}-${uuid.substring(16, 20)}-${uuid.substring(20, 32)}`
  }

  private static parse (uuid: String) {
    const parsed = uuid.match(UUID.pattern)?.groups

    return !parsed
      ? undefined
      : {
          time_low: parsed.time_low,
          time_mid: parsed.time_mid,
          time_high_and_version: parsed.time_high_and_version,
          version: parseInt(parsed.version),
          clock_seq_and_reserved: parsed.clock_seq_and_reserved,
          variant: parsed.variant,
          clock_seq_low: parsed.clock_seq_low,
          node: parsed.node
        }
  }

  parse = () => {
    return UUID.parse(this)
  }

  toBinary = () => {
    return Buffer.from(this.replaceAll('-', ''), 'hex')
  }

  static verify (uuid: String | Buffer) {
    if (Buffer.isBuffer(uuid)) {
      uuid = UUID.stringify(uuid)
    } else if (
      !(uuid instanceof String) &&
      typeof uuid !== 'string'
    ) {
      throw new TypeError('Invalid uuid')
    }

    return (
      uuid.replaceAll('-', '') === UUID.NIL.replaceAll('-', '') ||
      UUID.pattern.test(uuid as string)
    )
  }
}
