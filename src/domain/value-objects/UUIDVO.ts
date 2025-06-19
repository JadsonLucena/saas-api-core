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

export interface UUIDDTO {
  time_low: string,
  time_mid: string,
  time_high_and_version: string,
  version: number,
  clock_seq_and_reserved: string,
  variant: string,
  clock_seq_low: string,
  node: string,
}

export default class UUIDVO extends String {
  private static readonly pattern = /^\s*(?<time_low>[0-9a-f]{8})-?(?<time_mid>[0-9a-f]{4})-?(?<time_high_and_version>(?<version>[0-9a-f])[0-9a-f]{3})-?(?<clock_seq_and_reserved>(?<variant>[0-9a-d])[0-9a-f])(?<clock_seq_low>[0-9a-f]{2})-?(?<node>[0-9a-f]{12})\s*$/i

  static readonly DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
  static readonly NIL = '00000000-0000-0000-0000-000000000000'
  static readonly MAX = 'ffffffff-ffff-ffff-ffff-ffffffffffff'
  static readonly OID = '6ba7b812-9dad-11d1-80b4-00c04fd430c8'
  static readonly URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8'
  static readonly X500 = '6ba7b814-9dad-11d1-80b4-00c04fd430c8'

  constructor(uuid: inputUUID = crypto.randomUUID()) {
    if (!UUIDVO.verify(uuid)) {
      throw new TypeError('Invalid uuid')
    }
    
    const parsed = UUIDVO.parse(uuid)
    super(UUIDVO.stringify(parsed))

    Object.freeze(this)
  }

  static verify(uuid: inputUUID) {
    if (uuid instanceof UUIDVO) {
      uuid = uuid.toString()
    } else if (typeof uuid !== 'string') {
      uuid = UUIDVO.stringify(uuid)
    } else {
      uuid = UUIDVO.lint(uuid)
    }

    return (
      UUIDVO.pattern.test(uuid) ||
      uuid.replaceAll('-', '') === UUIDVO.NIL.replaceAll('-', '')
    )
  }

  parse = () => UUIDVO.parse(this)

  toBinary = () => {
    return Buffer.from(this.replaceAll('-', ''), 'hex')
  }

  private static parse(uuid: inputUUID): UUIDDTO {
    const parsed = (Buffer.isBuffer(uuid) ? uuid.toString('hex') : uuid).match(UUIDVO.pattern)?.groups

    return {
      time_low: parsed!.time_low,
      time_mid: parsed!.time_mid,
      time_high_and_version: parsed!.time_high_and_version,
      version: parseInt(parsed!.version),
      clock_seq_and_reserved: parsed!.clock_seq_and_reserved,
      variant: parsed!.variant,
      clock_seq_low: parsed!.clock_seq_low,
      node: parsed!.node
    }
  }

  private static stringify(uuid: UUIDDTO | Buffer) {
    if (Buffer.isBuffer(uuid)) {
      const stringified = uuid.toString('hex')

      return UUIDVO.lint(`${stringified.substring(0, 8)}-${stringified.substring(8, 12)}-${stringified.substring(12, 16)}-${stringified.substring(16, 20)}-${stringified.substring(20, 32)}`)
    }

    return UUIDVO.lint(`${uuid.time_low}-${uuid.time_mid}-${uuid.time_high_and_version}-${uuid.clock_seq_and_reserved}${uuid.clock_seq_low}-${uuid.node}`)
  }

  private static lint(uuid: string) {
    return uuid.replace(/\s+/g, '').normalize('NFC')
  }

  equals(uuid: inputUUID, ignoreCase: boolean = false) {
    if (!UUIDVO.verify(uuid)) {
      throw new TypeError('Invalid uuid')
    } else if (Buffer.isBuffer(uuid)) {
      uuid = UUIDVO.stringify(uuid)
    } else if (uuid instanceof UUIDVO) {
      uuid = uuid.toString()
    }

    if (ignoreCase) {
      return this.toString().toLowerCase() === UUIDVO.lint(uuid).toLowerCase()
    }

    return this.toString() === UUIDVO.lint(uuid)
  }
}

type inputUUID = string | UUIDVO | Buffer