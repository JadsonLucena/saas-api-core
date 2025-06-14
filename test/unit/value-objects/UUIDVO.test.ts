import crypto from 'node:crypto'
import { describe, it } from 'node:test'
import assert from 'node:assert'

import UUIDVO from '../../../src/domain/value-objects/UUIDVO.ts'

const RANDOM_UUID = crypto.randomUUID()
const RANDOM_UUID_NUMBERS_ONLY = RANDOM_UUID.replaceAll('-', '')
const RANDOM_UUID_BINARY = Buffer.from(RANDOM_UUID_NUMBERS_ONLY, 'hex')
const INVALID_UUID = [
  `${RANDOM_UUID}0`,
  RANDOM_UUID.slice(0, RANDOM_UUID.length - 1),
  RANDOM_UUID.replace(/[a-f]/, 'g'),
  // crypto.randomBytes(32)
]

describe('UUIDVO', () => {
  describe('Constructor', () => {
    it('fails to create an empty uuid', () => {
      assert.throws(() => new UUIDVO(''), new TypeError('Invalid uuid'))
      assert.throws(() => new UUIDVO(Buffer.from('')), new TypeError('Invalid uuid'))
    })

    it('fails to create an uuid with invalid data', () => {
      INVALID_UUID.forEach(uuid => {
        assert.throws(() => new UUIDVO(uuid), new TypeError('Invalid uuid'))
      })
    })

    it('should create uuid correctly', () => {
      assert.ok(new UUIDVO() instanceof UUIDVO)
      assert.ok(new UUIDVO(UUIDVO.DNS) instanceof UUIDVO)
      assert.ok(new UUIDVO(UUIDVO.NIL) instanceof UUIDVO)
      assert.ok(new UUIDVO(UUIDVO.OID) instanceof UUIDVO)
      assert.ok(new UUIDVO(UUIDVO.URL) instanceof UUIDVO)
      assert.ok(new UUIDVO(UUIDVO.X500) instanceof UUIDVO)

      assert.ok(new UUIDVO(RANDOM_UUID) instanceof UUIDVO)
      assert.ok(new UUIDVO(`  ${RANDOM_UUID}  `) instanceof UUIDVO)
      assert.ok(new UUIDVO(RANDOM_UUID_NUMBERS_ONLY) instanceof UUIDVO)
      assert.ok(new UUIDVO(RANDOM_UUID_BINARY) instanceof UUIDVO)

      assert.ok(new UUIDVO(new UUIDVO(RANDOM_UUID)) instanceof UUIDVO)
    })

    it('should create uuid correctly using fake uuid generating a false positive', () => {
      const data = 'b'
      const md5 = crypto.createHash('md5').update(data).digest('hex')
      const sha1 = crypto.createHash('sha1').update(data).digest('hex').slice(0, 32)

      assert.ok(new UUIDVO(md5) instanceof UUIDVO)
      assert.ok(new UUIDVO(sha1) instanceof UUIDVO)
    })

    it('should be immutable', () => {
      const uuid = new UUIDVO(RANDOM_UUID)

      const parsed = uuid.parse()

      assert.ok(Object.isFrozen(uuid))
      assert.throws(() => {
        uuid.parse = () => ({
          time_low: '',
          time_mid: '',
          time_high_and_version: '',
          version: 0,
          clock_seq_and_reserved: '',
          variant: '',
          clock_seq_low: '',
          node: ''
        })
      })
      assert.deepStrictEqual(uuid.parse(), { ...parsed })
    })
  })

  describe('Methods', () => {
    it('fails to verify an empty uuid', () => {
      assert.strictEqual(UUIDVO.verify(''), false)
      assert.strictEqual(UUIDVO.verify(Buffer.from('')), false)
    })

    it('fails to verify an uuid with invalid data', () => {
      INVALID_UUID.forEach(uuid => {
        assert.strictEqual(UUIDVO.verify(uuid), false)
      })
    })

    it('should verify uuid correctly', () => {
      assert.strictEqual(UUIDVO.verify(UUIDVO.DNS), true)
      assert.strictEqual(UUIDVO.verify(UUIDVO.NIL), true)
      assert.strictEqual(UUIDVO.verify(UUIDVO.OID), true)
      assert.strictEqual(UUIDVO.verify(UUIDVO.URL), true)
      assert.strictEqual(UUIDVO.verify(UUIDVO.X500), true)

      assert.strictEqual(UUIDVO.verify(RANDOM_UUID), true)
      assert.strictEqual(UUIDVO.verify(`  ${RANDOM_UUID}  `), true)
      assert.strictEqual(UUIDVO.verify(RANDOM_UUID_NUMBERS_ONLY), true)
      assert.strictEqual(UUIDVO.verify(RANDOM_UUID_BINARY), true)

      assert.strictEqual(UUIDVO.verify(new UUIDVO(RANDOM_UUID)), true)
    })

    it('should create uuid correctly using fake uuid generating a false positive', () => {
      const data = 'b'
      const md5 = crypto.createHash('md5').update(data).digest('hex')
      const sha1 = crypto.createHash('sha1').update(data).digest('hex').slice(0, 32)

      assert.strictEqual(UUIDVO.verify(md5), true)
      assert.strictEqual(UUIDVO.verify(sha1), true)
    })

    it('should parse an uuid', () => {
      const nilParsed = new UUIDVO(UUIDVO.NIL).parse()
      assert.deepStrictEqual(nilParsed, {
        time_low: '00000000',
        time_mid: '0000',
        time_high_and_version: '0000',
        version: 0,
        clock_seq_and_reserved: '00',
        variant: '0',
        clock_seq_low: '00',
        node: '000000000000'
      })

      const parsed = new UUIDVO(RANDOM_UUID).parse()
      assert.strictEqual(parsed!.time_low, RANDOM_UUID.toLowerCase().split('-')[0])
      assert.strictEqual(parsed!.time_mid, RANDOM_UUID.toLowerCase().split('-')[1])
      assert.strictEqual(parsed!.time_high_and_version, RANDOM_UUID.toLowerCase().split('-')[2])
      assert.strictEqual(parsed!.version, Number(RANDOM_UUID.toLowerCase().split('-')[2][0]))
      assert.strictEqual(`${parsed!.clock_seq_and_reserved}${parsed!.clock_seq_low}`, RANDOM_UUID.toLowerCase().split('-')[3])
      assert.strictEqual(parsed!.variant, RANDOM_UUID.toLowerCase().split('-')[3][0])
      assert.strictEqual(parsed!.node, RANDOM_UUID.toLowerCase().split('-')[4])
    })

    it('should work with binary uuid', () => {
      assert.ok(new UUIDVO(UUIDVO.NIL).toBinary().equals(Buffer.from(UUIDVO.NIL.replaceAll('-', ''), 'hex')))

      const binaryUUID = new UUIDVO(RANDOM_UUID).toBinary()
      assert.strictEqual(binaryUUID.length, 16)
      assert.deepStrictEqual(binaryUUID, RANDOM_UUID_BINARY)
      assert.strictEqual(new UUIDVO(binaryUUID).toString(), RANDOM_UUID)
    })

    it('should compare uuid', () => {
      const uuid1 = new UUIDVO(RANDOM_UUID)

      assert.ok(uuid1.equals(uuid1))
      assert.ok(uuid1.equals(new UUIDVO(uuid1)))
      assert.ok(uuid1.equals(uuid1.toBinary()))
      assert.ok(uuid1.equals(uuid1.toString()))
      assert.ok(uuid1.equals(uuid1.toString().toUpperCase(), true))
      assert.ok(!uuid1.equals(uuid1.toString().toUpperCase()))
      assert.ok(!uuid1.equals(new UUIDVO()))
      assert.throws(() => !uuid1.equals('invalid-uuid'), new TypeError('Invalid uuid'))
      assert.throws(() => !uuid1.equals(Buffer.from('invalid-uuid')), new TypeError('Invalid uuid'))
    })
  })
})