import { setTimeout } from 'timers/promises'

import UUID from '../../../build/domain/VO/UUID.js'

import HOTP from '../../../build/domain/entities/OTP/HOTP.js'
import TOTP from '../../../build/domain/entities/OTP/TOTP.js'

const MIN_OTP = {
  secret: '4XrOpQy@f#7z3d#8'
}
const MAX_OTP = {
  ...MIN_OTP,
  id: new UUID(),
  digestAlgorithm: 'sha1',
  length: 6,
  counter: 0,
  timeWindow: 30,
  createdAt: new Date(),
  updatedAt: new Date()
}
const INVALID_INPUT_TYPES = [
  {},
  [],
  Infinity,
  NaN,
  false
]

describe('Constructor', () => {
  test('Given that one wants to instantiate the object with an invalid argument', () => {
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new HOTP(input)).toThrowError()
    })
    INVALID_INPUT_TYPES.concat(null, undefined, 0, '123').forEach(input => {
      expect(() => new HOTP({
        ...MAX_OTP,
        secret: input
      })).toThrowError(new TypeError('Invalid secret'))
    })
    INVALID_INPUT_TYPES.concat(null, '', 0).forEach(input => {
      expect(() => new HOTP({
        ...MAX_OTP,
        digestAlgorithm: input
      })).toThrowError(new TypeError('Invalid digestAlgorithm'))
    })
    INVALID_INPUT_TYPES.concat(null, '', 5, 6.5).forEach(input => {
      expect(() => new HOTP({
        ...MAX_OTP,
        length: input
      })).toThrowError(new TypeError('Invalid length'))
    })
    INVALID_INPUT_TYPES.concat(null, '', -1, 0.5).forEach(input => {
      expect(() => new HOTP({
        ...MAX_OTP,
        counter: input
      })).toThrowError(new TypeError('Invalid counter'))
    })
    INVALID_INPUT_TYPES.concat('', 0).forEach(input => {
      expect(() => new HOTP({
        ...MAX_OTP,
        updatedAt: input
      })).toThrowError(new TypeError('Invalid updatedAt'))
    })
    INVALID_INPUT_TYPES.concat(null, '', 0).forEach(input => {
      expect(() => new HOTP({
        ...MAX_OTP,
        disabledAt: input
      })).toThrowError(new TypeError('Invalid disabledAt'))
    })

    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new TOTP(input)).toThrowError()
    })
    INVALID_INPUT_TYPES.concat(null, undefined, 0).forEach(input => {
      expect(() => new TOTP({
        ...MAX_OTP,
        secret: input
      })).toThrowError(new TypeError('Invalid secret'))
    })
    INVALID_INPUT_TYPES.concat(null, '', 0).forEach(input => {
      expect(() => new TOTP({
        ...MAX_OTP,
        digestAlgorithm: input
      })).toThrowError(new TypeError('Invalid digestAlgorithm'))
    })
    INVALID_INPUT_TYPES.concat(null, '').forEach(input => {
      expect(() => new TOTP({
        ...MAX_OTP,
        length: input
      })).toThrowError(new TypeError('Invalid length'))
    })
    INVALID_INPUT_TYPES.concat(null, '', 0).forEach(input => {
      expect(() => new TOTP({
        ...MAX_OTP,
        timeWindow: input
      })).toThrowError(new TypeError('Invalid timeWindow'))
    })
    INVALID_INPUT_TYPES.concat('', 0).forEach(input => {
      expect(() => new TOTP({
        ...MAX_OTP,
        updatedAt: input
      })).toThrowError(new TypeError('Invalid updatedAt'))
    })
    INVALID_INPUT_TYPES.concat(null, '', 0).forEach(input => {
      expect(() => new TOTP({
        ...MAX_OTP,
        disabledAt: input
      })).toThrowError(new TypeError('Invalid disabledAt'))
    })
  })

  test('Given that one wants to instantiate the object with a valid argument', () => {
    expect(() => new HOTP(MIN_OTP)).not.toThrow()
    expect(() => new HOTP(MAX_OTP)).not.toThrow()

    const hotp = new HOTP(MAX_OTP)
    expect(hotp.createdAt).toEqual(hotp.updatedAt)

    expect(() => new TOTP(MIN_OTP)).not.toThrow()
    expect(() => new TOTP(MAX_OTP)).not.toThrow()

    const totp = new TOTP(MAX_OTP)
    expect(totp.createdAt).toEqual(totp.updatedAt)
  })
})

describe('Attributes', () => {
  test('Given that we want to check for entity update whenever an attribute is updated', () => {
    const hotp = new HOTP(MIN_OTP)

    let updatedAt = hotp.updatedAt
    hotp.secret = MAX_OTP.secret
    expect(hotp.secret).toBe(MAX_OTP.secret)
    expect(hotp.updatedAt).not.toBe(updatedAt)

    updatedAt = hotp.updatedAt
    hotp.digestAlgorithm = MAX_OTP.digestAlgorithm
    expect(hotp.digestAlgorithm).toBe(MAX_OTP.digestAlgorithm)
    expect(hotp.updatedAt).not.toBe(updatedAt)

    updatedAt = hotp.updatedAt
    hotp.length = MAX_OTP.length
    expect(hotp.length).toBe(MAX_OTP.length)
    expect(hotp.updatedAt).not.toBe(updatedAt)

    updatedAt = hotp.updatedAt
    hotp.counter = MAX_OTP.counter
    expect(hotp.counter).toBe(MAX_OTP.counter)
    expect(hotp.updatedAt).not.toBe(updatedAt)

    updatedAt = hotp.updatedAt
    hotp.disable()
    expect(hotp.disabledAt).toBe(hotp.updatedAt)
    expect(hotp.updatedAt).not.toBe(updatedAt)

    updatedAt = hotp.updatedAt
    hotp.enable()
    expect(hotp.disabledAt).toBeUndefined()
    expect(hotp.updatedAt).not.toBe(updatedAt)

    const totp = new TOTP(MIN_OTP)

    updatedAt = totp.updatedAt
    totp.secret = MAX_OTP.secret
    expect(totp.secret).toBe(MAX_OTP.secret)
    expect(totp.updatedAt).not.toBe(updatedAt)

    updatedAt = totp.updatedAt
    totp.digestAlgorithm = MAX_OTP.digestAlgorithm
    expect(totp.digestAlgorithm).toBe(MAX_OTP.digestAlgorithm)
    expect(totp.updatedAt).not.toBe(updatedAt)

    updatedAt = totp.updatedAt
    totp.length = MAX_OTP.length
    expect(totp.length).toBe(MAX_OTP.length)
    expect(totp.updatedAt).not.toBe(updatedAt)

    updatedAt = totp.updatedAt
    totp.timeWindow = MAX_OTP.timeWindow
    expect(totp.timeWindow).toBe(MAX_OTP.timeWindow)
    expect(totp.updatedAt).not.toBe(updatedAt)

    updatedAt = totp.updatedAt
    totp.disable()
    expect(totp.disabledAt).toBe(totp.updatedAt)
    expect(totp.updatedAt).not.toBe(updatedAt)

    updatedAt = totp.updatedAt
    totp.enable()
    expect(totp.disabledAt).toBeUndefined()
    expect(totp.updatedAt).not.toBe(updatedAt)
  })

  test('Given that we want to disable the entity', () => {
    const hotp = new HOTP(MIN_OTP)

    hotp.disable()

    expect(() => {
      hotp.secret = MAX_OTP.secret
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      hotp.digestAlgorithm = MAX_OTP.digestAlgorithm
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      hotp.length = MAX_OTP.length
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      hotp.counter = MAX_OTP.counter
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      hotp.updatedAt = new Date()
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      hotp.disable()
    }).toThrowError(new Error('It\'s already disabled'))

    expect(() => {
      hotp.enable()
    }).not.toThrow()
    expect(() => {
      hotp.enable()
    }).toThrowError(new Error('It\'s already enabled'))

    expect(hotp.disabledAt).toBeUndefined()

    const totp = new TOTP(MIN_OTP)

    totp.disable()

    expect(() => {
      totp.secret = MAX_OTP.secret
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      totp.digestAlgorithm = MAX_OTP.digestAlgorithm
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      totp.length = MAX_OTP.length
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      totp.timeWindow = MAX_OTP.timeWindow
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      totp.disable()
    }).toThrowError(new Error('It\'s already disabled'))

    expect(() => {
      totp.enable()
    }).not.toThrow()
    expect(() => {
      totp.enable()
    }).toThrowError(new Error('It\'s already enabled'))

    expect(totp.disabledAt).toBeUndefined()
  })
})

describe('Methods', () => {
  test('Given that we want to generate a HOTP', () => {
    const hotp = new HOTP(MIN_OTP)

    expect(hotp.generate()).toBe('086544')

    hotp.incrementCounter()
    expect(hotp.generate()).toBe('324757')

    hotp.digestAlgorithm = 'sha256'
    expect(hotp.generate()).toBe('818077')

    hotp.digestAlgorithm = 'sha512'
    expect(hotp.generate()).toBe('117885')

    hotp.counter = 10
    expect(hotp.generate()).toBe('745172')

    hotp.length = 8
    expect(hotp.generate()).toBe('29745172')
  })
  test('Given that we want to generate a TOTP', async () => {
    const totp = new TOTP(MIN_OTP)
    const hotp = new HOTP(MIN_OTP)

    const timeLeft = totp.timeWindow - (Math.floor(Date.now() / 1000) % totp.timeWindow)
    // checks if there are a maximum of 2s left for the code to change, if so, wait so that subsequent codes do not differ during verification
    if (timeLeft <= 2) {
      await setTimeout(timeLeft)
    }

    hotp.counter = Math.floor(Math.floor(Date.now() / 1000) / totp.timeWindow)
    expect(totp.generate()).toBe(hotp.generate())

    hotp.digestAlgorithm = totp.digestAlgorithm = 'sha256'
    hotp.counter = Math.floor(Math.floor(Date.now() / 1000) / totp.timeWindow)
    expect(totp.generate()).toBe(hotp.generate())

    hotp.digestAlgorithm = totp.digestAlgorithm = 'sha512'
    hotp.counter = Math.floor(Math.floor(Date.now() / 1000) / totp.timeWindow)
    expect(totp.generate()).toBe(hotp.generate())

    hotp.counter = totp.counter = 10
    hotp.counter = Math.floor(Math.floor(Date.now() / 1000) / totp.timeWindow)
    expect(totp.generate()).toBe(hotp.generate())

    hotp.length = totp.length = 8
    hotp.counter = Math.floor(Math.floor(Date.now() / 1000) / totp.timeWindow)
    expect(totp.generate()).toBe(hotp.generate())

    totp.timeWindow = 60
    hotp.counter = Math.floor(Math.floor(Date.now() / 1000) / totp.timeWindow)
    expect(totp.generate()).toBe(hotp.generate())
  })
})
