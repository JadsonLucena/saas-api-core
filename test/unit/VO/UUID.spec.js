import crypto from 'node:crypto'

import UUID from '../../../build/domain/VO/UUID.js'

const RANDOM_UUID = crypto.randomUUID()
const RANDOM_UUID_NUMBERS_ONLY = RANDOM_UUID.replaceAll('-', '')
const RANDOM_UUID_BINARY = Buffer.from(RANDOM_UUID_NUMBERS_ONLY, 'hex')
const INVALID_UUID = [
  '',
  `${RANDOM_UUID}0`,
  RANDOM_UUID.slice(0, RANDOM_UUID.length - 1),
  RANDOM_UUID.replace(/[a-f]/, 'g')
]
const INVALID_INPUT_TYPES = [
  0,
  Infinity,
  NaN,
  [],
  {},
  null,
  false
]

describe('Constructor', () => {
  test('Given that one wants to instantiate the object with invalid argument', () => {
    INVALID_UUID.forEach(uuid => {
      expect(() => new UUID(uuid)).toThrowError(new TypeError('Invalid uuid'))
    })
    INVALID_INPUT_TYPES.forEach(uuid => {
      expect(() => new UUID(uuid)).toThrowError(new TypeError('Invalid uuid'))
    })
  })

  test('Given that one wants to instantiate the object with a valid argument', () => {
    expect(() => new UUID()).not.toThrow()
    expect(() => new UUID(UUID.DNS)).not.toThrow()
    expect(() => new UUID(UUID.NIL)).not.toThrow()
    expect(() => new UUID(UUID.OID)).not.toThrow()
    expect(() => new UUID(UUID.URL)).not.toThrow()
    expect(() => new UUID(UUID.X500)).not.toThrow()

    expect(new UUID(RANDOM_UUID).toString()).toBe(RANDOM_UUID)
    expect(new UUID(`  ${RANDOM_UUID}  `).toString()).toBe(RANDOM_UUID)
    expect(new UUID(RANDOM_UUID_NUMBERS_ONLY).toString()).toBe(RANDOM_UUID)
    expect(new UUID(RANDOM_UUID_BINARY).toString()).toBe(RANDOM_UUID)

    const uuid = new UUID(RANDOM_UUID)
    expect(new UUID(uuid).toString()).toBe(uuid.toString())
    expect(new UUID(uuid).parse()).toMatchObject(uuid.parse())

    // Ignore Case
    expect(new UUID(RANDOM_UUID).localeCompare(RANDOM_UUID.toUpperCase(), undefined, { sensitivity: 'accent' }) === 0).toBeTruthy()
  })

  test('Given that one wants to check if a uuid is valid using fake uuid generating a false positive', () => {
    const data = 'b'
    const md5 = crypto.createHash('md5').update(data).digest('hex')
    const sha1 = crypto.createHash('sha1').update(data).digest('hex').slice(0, 32)

    expect(() => new UUID(md5)).not.toThrow()
    expect(() => new UUID(sha1)).not.toThrow()
  })
})

describe('Methods', () => {
  test('Given that one wants to parse a uuid', () => {
    expect(new UUID(UUID.NIL).parse()).toBeUndefined()

    const parsedUUID = new UUID(RANDOM_UUID).parse()
    expect(parsedUUID).toBeDefined()
    expect(RANDOM_UUID.toLowerCase().split('-')[0]).toBe(parsedUUID?.time_low)
    expect(RANDOM_UUID.toLowerCase().split('-')[1]).toBe(parsedUUID?.time_mid)
    expect(RANDOM_UUID.toLowerCase().split('-')[2]).toBe(parsedUUID?.time_high_and_version)
    expect(Number(RANDOM_UUID.toLowerCase().split('-')[2][0])).toBe(parsedUUID?.version)
    expect(RANDOM_UUID.toLowerCase().split('-')[3]).toBe(`${parsedUUID?.clock_seq_and_reserved}${parsedUUID?.clock_seq_low}`)
    expect(RANDOM_UUID.toLowerCase().split('-')[3][0]).toBe(parsedUUID?.variant)
    expect(RANDOM_UUID.toLowerCase().split('-')[4]).toBe(parsedUUID?.node)
  })

  test('Given that one wants to work with uuid in binary', () => {
    expect(new UUID(UUID.NIL).toBinary()).toEqual(Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))

    const binaryUUID = new UUID(RANDOM_UUID).toBinary()
    expect(binaryUUID.length).toBe(16)
    expect(binaryUUID).toEqual(RANDOM_UUID_BINARY)
    expect(new UUID(binaryUUID).toString()).toBe(RANDOM_UUID)
  })

  test('Given that one wants to verify uuid with invalid arguments', () => {
    INVALID_UUID.forEach(uuid => {
      expect(UUID.verify(uuid)).toBeFalsy()
    })
    INVALID_INPUT_TYPES.forEach(uuid => {
      expect(() => UUID.verify(uuid)).toThrowError(new TypeError('Invalid uuid'))
    })
  })

  test('Given that one wants to verify uuid with valid arguments', () => {
    expect(UUID.verify(UUID.DNS)).toBeTruthy()
    expect(UUID.verify(UUID.NIL)).toBeTruthy()
    expect(UUID.verify(UUID.OID)).toBeTruthy()
    expect(UUID.verify(UUID.URL)).toBeTruthy()
    expect(UUID.verify(UUID.X500)).toBeTruthy()

    expect(UUID.verify(RANDOM_UUID).toString()).toBeTruthy()
    expect(UUID.verify(`  ${RANDOM_UUID}  `).toString()).toBeTruthy()
    expect(UUID.verify(RANDOM_UUID_NUMBERS_ONLY).toString()).toBeTruthy()
    expect(UUID.verify(RANDOM_UUID_BINARY).toString()).toBeTruthy()
  })
})
