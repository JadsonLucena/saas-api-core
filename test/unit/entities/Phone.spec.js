import UUID from '../../../build/domain/VO/UUID.js'
import PhoneVO from '../../../build/domain/VO/Phone.js'

import Phone from '../../../build/domain/entities/Phone.js'

const MIN_PHONE = {
  value: new PhoneVO('+0 (1) 234-5678')
}
const MAX_PHONE = {
  ...MIN_PHONE,
  id: new UUID(),
  createdAt: new Date(),
  confirmedAt: new Date()
  // disabledAt: new Date()
}
const INVALID_INPUT_TYPES = [
  {},
  [],
  '',
  0,
  Infinity,
  NaN,
  false
]

describe('Constructor', () => {
  test('Given that one wants to instantiate the object with an invalid argument', () => {
    INVALID_INPUT_TYPES.concat(undefined, null).forEach(input => {
      expect(() => new Phone(input)).toThrowError()
    })

    INVALID_INPUT_TYPES.concat(undefined, null).forEach(input => {
      expect(() => new Phone({
        ...MAX_PHONE,
        value: input
      })).toThrowError(new TypeError('Invalid value'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new Phone({
        ...MAX_PHONE,
        confirmedAt: input
      })).toThrowError(new TypeError('Invalid confirmedAt'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new Phone({
        ...MAX_PHONE,
        disabledAt: input
      })).toThrowError(new TypeError('Invalid disabledAt'))
    })

    // expect(() => new Phone({
    //   value: INVALID_INPUT_TYPES.concat(undefined, null)[Math.floor(Math.random() * INVALID_INPUT_TYPES.concat(undefined, null).length)],
    //   confirmedAt: INVALID_INPUT_TYPES[Math.floor(Math.random() * INVALID_INPUT_TYPES.length)],
    //   disabledAt: INVALID_INPUT_TYPES[Math.floor(Math.random() * INVALID_INPUT_TYPES.length)]
    // })).toThrow(AggregateError)
  })

  test('Given that one wants to instantiate the object with a valid argument', () => {
    expect(() => new Phone(MIN_PHONE)).not.toThrow()
    expect(() => new Phone(MAX_PHONE)).not.toThrow()

    const phone = new Phone(MAX_PHONE)
    expect(phone.value).toBe(MAX_PHONE.value)
  })
})

describe('Attributes', () => {
  test('Given that we want to try to update readonly attributes', () => {
    const phone = new Phone(MIN_PHONE)

    expect(() => {
      phone.value = new PhoneVO('+01-234 (123) 67890-1234')
    }).toThrow()
  })
  test('Given that we want to confirm the entity', () => {
    const phone = new Phone(MIN_PHONE)

    phone.confirmedAt = new Date()

    expect(() => {
      phone.confirmedAt = MAX_PHONE.confirmedAt
    }).toThrowError(new Error('It\'s already confirmed'))

    expect(() => {
      phone.confirmedAt = undefined
    }).not.toThrow()

    expect(phone.confirmedAt).toBeUndefined()
  })
  test('Given that we want to disable the entity', () => {
    const phone = new Phone(MIN_PHONE)

    phone.disabledAt = new Date()

    expect(() => {
      phone.confirmedAt = MAX_PHONE.name
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      phone.disabledAt = new Date()
    }).toThrowError(new Error('It\'s already disabled'))

    expect(() => {
      phone.disabledAt = undefined
    }).not.toThrow()

    expect(phone.disabledAt).toBeUndefined()
  })
})
