import Phone from '../../../build/domain/VO/Phone.js'

const MIN_PHONE = {
  country: '0',
  area: 1,
  number: '2345678'
}
const MAX_PHONE = {
  country: '+01-234',
  area: 123,
  number: '6 7890-1234'
}
const VALID_PHONES = [
  {
    in: Object.values(MIN_PHONE).join(' '),
    out: '+0 (1) 234-5678'
  },
  {
    in: Object.values(MAX_PHONE).join(' '),
    out: '+01-234 (123) 67890-1234'
  },
  {
    in: '  +  01  -  123   (  123  )   9   1799  -  2164  ',
    out: '+01-123 (123) 91799-2164'
  },
  {
    in: '+01-123 (123) 9 1799-2164',
    out: '+01-123 (123) 91799-2164'
  },
  {
    in: '01-123 (123) 9 1799-2164',
    out: '+01-123 (123) 91799-2164'
  },
  {
    in: '01-123 123 9 1799-2164',
    out: '+01-123 (123) 91799-2164'
  },
  {
    in: '01-123 123 917992164',
    out: '+01-123 (123) 91799-2164'
  },
  {
    in: '123 123 917992164',
    out: '+123 (123) 91799-2164'
  },
  {
    in: '123(123)917992164',
    out: '+123 (123) 91799-2164'
  }
]
const INVALID_PHONES = [
  '',
  '+43 (f7) 51799-21a4',
  '+12 (34) 1212-1212',
  '+01 (10) 99999-9999',
  Object.values(MIN_PHONE).join(' ').slice(0, -1),
  `${Object.values(MAX_PHONE).join(' ')}0`
]
const INVALID_INPUT_TYPES = [
  Infinity,
  NaN,
  [],
  null,
  false
]

describe('Constructor', () => {
  test('Given that one wants to instantiate the object with invalid arguments', () => {
    INVALID_PHONES.forEach(phone => {
      expect(() => new Phone(phone)).toThrowError(new TypeError('Invalid phone'))
    })

    expect(() => new Phone({})).toThrow(AggregateError)

    expect(() => new Phone({
      ...MAX_PHONE,
      country: ''
    })).toThrowError(new TypeError('Invalid phone'))
    expect(() => new Phone({
      ...MAX_PHONE,
      number: ''
    })).toThrowError(new TypeError('Invalid phone'))

    INVALID_INPUT_TYPES.concat('', 0, undefined).forEach(input => {
      expect(() => new Phone(input)).toThrowError(new TypeError('Invalid phone'))
    })

    INVALID_INPUT_TYPES.concat({}, 0, undefined).forEach(input => {
      expect(() => new Phone({
        ...MAX_PHONE,
        country: input
      })).toThrowError(new TypeError('Invalid country'))
    })
    INVALID_INPUT_TYPES.concat({}, -1, 1.1, Number.MAX_SAFE_INTEGER + 1, undefined).forEach(input => {
      expect(() => new Phone({
        ...MAX_PHONE,
        area: input
      })).toThrowError(new TypeError('Invalid area'))
    })
    INVALID_INPUT_TYPES.concat({}, 0, undefined).forEach(input => {
      expect(() => new Phone({
        ...MAX_PHONE,
        number: input
      })).toThrowError(new TypeError('Invalid number'))
    })

    expect(() => new Phone({
      country: (input => input[Math.floor(Math.random() * input.length)])(INVALID_INPUT_TYPES.concat({}, 0, undefined)),
      area: (input => input[Math.floor(Math.random() * input.length)])(INVALID_INPUT_TYPES.concat({}, -1, 1.1, Number.MAX_SAFE_INTEGER + 1, undefined)),
      number: (input => input[Math.floor(Math.random() * input.length)])(INVALID_INPUT_TYPES.concat({}, 0, undefined))
    })).toThrow(AggregateError)
  })

  test('Given that one wants to instantiate the object with valid arguments', () => {
    VALID_PHONES.forEach(phone => {
      expect(new Phone(phone.in).toString()).toBe(phone.out)
    })

    const phone = new Phone(MIN_PHONE)
    expect(new Phone(phone).toString()).toBe(phone.toString())
    expect(new Phone(phone).parse()).toMatchObject(phone.parse())
  })
})

describe('Methods', () => {
  test('Given that one wants to parse a phone', () => {
    const parsedMinPhone = new Phone(MIN_PHONE).parse()

    expect(parsedMinPhone).toBeDefined()
    expect(parsedMinPhone?.country).toBe(`+${MIN_PHONE.country}`)
    expect(parsedMinPhone?.area).toBe(MIN_PHONE.area)
    expect(parsedMinPhone?.number.replace('-', '')).toBe(MIN_PHONE.number)

    const parsedMaxPhone = new Phone(MAX_PHONE).parse()

    expect(parsedMaxPhone).toBeDefined()
    expect(parsedMaxPhone?.country).toBe(MAX_PHONE.country)
    expect(parsedMaxPhone?.area).toBe(MAX_PHONE.area)
    expect(parsedMaxPhone?.number).toBe(MAX_PHONE.number.replaceAll(' ', ''))
  })

  test('Given that one wants to verify a phone with invalid arguments', () => {
    INVALID_PHONES.forEach(phone => {
      expect(Phone.verify(phone)).toBeFalsy()
    })

    expect(Phone.verify('')).toBeFalsy()
    expect(() => Phone.verify({})).toThrow(AggregateError)

    expect(Phone.verify({
      ...MAX_PHONE,
      country: ''
    })).toBeFalsy()
    expect(Phone.verify({
      ...MAX_PHONE,
      number: ''
    })).toBeFalsy()

    INVALID_INPUT_TYPES.concat(0, undefined).forEach(input => {
      expect(() => Phone.verify(input)).toThrowError(new TypeError('Invalid phone'))
    })

    INVALID_INPUT_TYPES.concat({}, 0, undefined).forEach(input => {
      expect(() => Phone.verify({
        ...MAX_PHONE,
        country: input
      })).toThrowError(new TypeError('Invalid country'))
    })
    INVALID_INPUT_TYPES.concat({}, -1, 1.1, Number.MAX_SAFE_INTEGER + 1, undefined).forEach(input => {
      expect(() => Phone.verify({
        ...MAX_PHONE,
        area: input
      })).toThrowError(new TypeError('Invalid area'))
    })
    INVALID_INPUT_TYPES.concat({}, 0, undefined).forEach(input => {
      expect(() => Phone.verify({
        ...MAX_PHONE,
        number: input
      })).toThrowError(new TypeError('Invalid number'))
    })

    expect(() => Phone.verify({
      country: (input => input[Math.floor(Math.random() * input.length)])(INVALID_INPUT_TYPES.concat({}, 0, undefined)),
      area: (input => input[Math.floor(Math.random() * input.length)])(INVALID_INPUT_TYPES.concat({}, -1, 1.1, Number.MAX_SAFE_INTEGER + 1, undefined)),
      number: (input => input[Math.floor(Math.random() * input.length)])(INVALID_INPUT_TYPES.concat({}, 0, undefined))
    })).toThrow(AggregateError)
  })

  test('Given that one wants to verify a phone with invalid arguments', () => {
    VALID_PHONES.forEach(phone => {
      expect(Phone.verify(phone.in)).toBeTruthy()
    })

    expect(Phone.verify(MIN_PHONE)).toBeTruthy()
    expect(Phone.verify(MAX_PHONE)).toBeTruthy()
  })
})
