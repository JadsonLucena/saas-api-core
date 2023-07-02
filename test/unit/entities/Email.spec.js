import UUID from '../../../build/domain/VO/UUID.js'
import EmailVO from '../../../build/domain/VO/Email.js'

import Email from '../../../build/domain/entities/Email.js'

const MIN_EMAIL = {
  value: new EmailVO('john.doe@example.com')
}
const MAX_EMAIL = {
  ...MIN_EMAIL,
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
      expect(() => new Email(input)).toThrowError()
    })

    expect(() => new Email({
      ...MAX_EMAIL,
      value: new EmailVO('john.doe', false)
    })).toThrowError(new TypeError('Domain required'))

    INVALID_INPUT_TYPES.concat(undefined, null).forEach(input => {
      expect(() => new Email({
        ...MAX_EMAIL,
        value: input
      })).toThrowError(new TypeError('Invalid value'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new Email({
        ...MAX_EMAIL,
        confirmedAt: input
      })).toThrowError(new TypeError('Invalid confirmedAt'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new Email({
        ...MAX_EMAIL,
        disabledAt: input
      })).toThrowError(new TypeError('Invalid disabledAt'))
    })

    // expect(() => new Email({
    //   value: INVALID_INPUT_TYPES.concat(undefined, null)[Math.floor(Math.random() * INVALID_INPUT_TYPES.concat(undefined, null).length)],
    //   confirmedAt: INVALID_INPUT_TYPES[Math.floor(Math.random() * INVALID_INPUT_TYPES.length)],
    //   disabledAt: INVALID_INPUT_TYPES[Math.floor(Math.random() * INVALID_INPUT_TYPES.length)]
    // })).toThrow(AggregateError)
  })

  test('Given that one wants to instantiate the object with a valid argument', () => {
    expect(() => new Email(MIN_EMAIL)).not.toThrow()
    expect(() => new Email(MAX_EMAIL)).not.toThrow()

    const email = new Email(MAX_EMAIL)
    expect(email.value).toBe(MAX_EMAIL.value)
  })
})

describe('Attributes', () => {
  test('Given that we want to try to update readonly attributes', () => {
    const email = new Email(MIN_EMAIL)

    expect(() => {
      email.value = new EmailVO('login@example.com')
    }).toThrow()
  })
  test('Given that we want to confirm the entity', () => {
    const email = new Email(MIN_EMAIL)

    email.confirmedAt = new Date()

    expect(() => {
      email.confirmedAt = MAX_EMAIL.confirmedAt
    }).toThrowError(new Error('It\'s already confirmed'))

    expect(() => {
      email.confirmedAt = undefined
    }).not.toThrow()

    expect(email.confirmedAt).toBeUndefined()
  })
  test('Given that we want to disable the entity', () => {
    const email = new Email(MIN_EMAIL)

    email.disabledAt = new Date()

    expect(() => {
      email.confirmedAt = MAX_EMAIL.name
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      email.disabledAt = new Date()
    }).toThrowError(new Error('It\'s already disabled'))

    expect(() => {
      email.disabledAt = undefined
    }).not.toThrow()

    expect(email.disabledAt).toBeUndefined()
  })
})
