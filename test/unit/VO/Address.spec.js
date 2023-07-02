import Address from '../../../build/domain/VO/Address.js'

const MIN_ADDRESS = {
  street: 'One Microsoft Way',
  city: 'Redmond',
  state: 'WA',
  postalCode: '98052',
  country: 'USA'
} // One of Microsoft's headquarters
const MAX_ADDRESS = {
  number: 2.354,
  street: 'Estrada das Canoas',
  complement: 'Casa 2',
  district: 'São Conrado',
  city: 'Rio de Janeiro',
  state: 'RJ',
  postalCode: '22610-210',
  country: 'BR'
} // Casa das Canoas designed by architect Oscar Niemeyer

const VALID_ADDRESSES = [
  Object.values(MIN_ADDRESS).join(', '),
  `${MAX_ADDRESS.number}, ${MAX_ADDRESS.street} (${MAX_ADDRESS.complement}), ${MAX_ADDRESS.district}, ${MAX_ADDRESS.city}, ${MAX_ADDRESS.state}, ${MAX_ADDRESS.postalCode}, ${MAX_ADDRESS.country}`,
  '  2.354,   Estrada   das   Canoas   (  Casa   2  )  ,   São   Conrado,   Rio   de   Janeiro,   RJ,   22610-210,   BR  ',
  '1600, Amphitheatre Parkway, Mountain View, CA, 94043, USA',
  '1, Hacker Way, Menlo Park, CA, 94025, USA',
  '1, Đường Hacker, Menlo Park, CA, 94025, Hoa Kỳ',
  '1, Hacker Way, Menlo Park, CA, 94025, EE. UU.', // Spanish
  '1, Hacker Way, Menlo Park, CA, 94025, États-Unis', // French
  '1, Hacker Way, Menlo Park, CA, 94025, 美国', // Chinese (Simplified)
  '1, ハッカーウェイ, メンローパーク, CA, 94025, 米国', // Japanese
  '1, 해커 웨이, 멘로 파크, CA, 94025, USA', // Korean
  '1, Хакер Уэй, Менло-Парк, Калифорния, 94025, США' // Russian
]
const INVALID_ADDRESSES = [
  // `${MAX_ADDRESS.number}, ${MAX_ADDRESS.street} (${MAX_ADDRESS.complement}), ${MAX_ADDRESS.district}, ${MAX_ADDRESS.city}, ${MAX_ADDRESS.state}, ${MAX_ADDRESS.postalCode}, ${MAX_ADDRESS.country}, foo`,
  Object.values(MIN_ADDRESS).filter((field, i) => i !== 0).join(', '),
  Object.values(MIN_ADDRESS).filter((field, i) => i !== 1).join(', '),
  Object.values(MIN_ADDRESS).filter((field, i) => i !== 2).join(', '),
  Object.values(MIN_ADDRESS).filter((field, i) => i !== 3).join(', '),
  Object.values(MIN_ADDRESS).filter((field, i) => i !== 4).join(', ')
  // `2.354, Estrada das Canoas (${'Bloco (E), AP 222'}), São Conrado, Rio de Janeiro, RJ, 22610-210, BR`
]
const INVALID_INPUT_TYPES = [
  0,
  Infinity,
  NaN,
  [],
  null,
  false,
  undefined
]

describe('Constructor', () => {
  test('Given that one wants to instantiate the object with invalid arguments', () => {
    INVALID_ADDRESSES.forEach(address => {
      expect(() => new Address(address)).toThrowError(new TypeError('Invalid address'))
    })

    expect(() => new Address('')).toThrowError(new TypeError('Invalid address'))
    expect(() => new Address({})).toThrow(AggregateError)

    expect(() => new Address({
      ...MAX_ADDRESS,
      city: ''
    })).toThrowError(new TypeError('Invalid address'))
    expect(() => new Address({
      ...MAX_ADDRESS,
      country: ''
    })).toThrowError(new TypeError('Invalid address'))
    expect(() => new Address({
      ...MAX_ADDRESS,
      postalCode: ''
    })).toThrowError(new TypeError('Invalid address'))
    expect(() => new Address({
      ...MAX_ADDRESS,
      state: ''
    })).toThrowError(new TypeError('Invalid address'))
    expect(() => new Address({
      ...MAX_ADDRESS,
      street: ''
    })).toThrowError(new TypeError('Invalid address'))

    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new Address(input)).toThrowError(new TypeError('Invalid address'))
    })

    const invalidInputTypesForOptionalFields = INVALID_INPUT_TYPES.filter(input => typeof input !== 'undefined')
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new Address({
        ...MAX_ADDRESS,
        city: input
      })).toThrowError(new TypeError('Invalid city'))
    })
    invalidInputTypesForOptionalFields.forEach(input => {
      expect(() => new Address({
        ...MAX_ADDRESS,
        complement: input
      })).toThrowError(new TypeError('Invalid complement'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new Address({
        ...MAX_ADDRESS,
        country: input
      })).toThrowError(new TypeError('Invalid country'))
    })
    invalidInputTypesForOptionalFields.forEach(input => {
      expect(() => new Address({
        ...MAX_ADDRESS,
        district: input
      })).toThrowError(new TypeError('Invalid district'))
    })
    invalidInputTypesForOptionalFields.filter(input => !Number.isFinite(input)).forEach(input => {
      expect(() => new Address({
        ...MAX_ADDRESS,
        number: input
      })).toThrowError(new TypeError('Invalid number'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new Address({
        ...MAX_ADDRESS,
        postalCode: input
      })).toThrowError(new TypeError('Invalid postalCode'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new Address({
        ...MAX_ADDRESS,
        state: input
      })).toThrowError(new TypeError('Invalid state'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new Address({
        ...MAX_ADDRESS,
        street: input
      })).toThrowError(new TypeError('Invalid street'))
    })

    expect(() => new Address({
      city: INVALID_INPUT_TYPES[Math.floor(Math.random() * INVALID_INPUT_TYPES.length)],
      complement: invalidInputTypesForOptionalFields[Math.floor(Math.random() * invalidInputTypesForOptionalFields.length)],
      country: INVALID_INPUT_TYPES[Math.floor(Math.random() * INVALID_INPUT_TYPES.length)],
      district: invalidInputTypesForOptionalFields[Math.floor(Math.random() * invalidInputTypesForOptionalFields.length)],
      number: invalidInputTypesForOptionalFields.filter(input => !Number.isFinite(input))[Math.floor(Math.random() * invalidInputTypesForOptionalFields.filter(input => !Number.isFinite(input)).length)],
      postalCode: INVALID_INPUT_TYPES[Math.floor(Math.random() * INVALID_INPUT_TYPES.length)],
      state: INVALID_INPUT_TYPES[Math.floor(Math.random() * INVALID_INPUT_TYPES.length)],
      street: INVALID_INPUT_TYPES[Math.floor(Math.random() * INVALID_INPUT_TYPES.length)]
    })).toThrow(AggregateError)
  })

  test('Given that one wants to instantiate the object with valid arguments', () => {
    VALID_ADDRESSES.forEach(address => {
      expect(() => new Address(address)).not.toThrow()
    })

    const minAddress = new Address(MIN_ADDRESS)
    expect(new Address(minAddress).toString()).toBe(minAddress.toString())
    expect(new Address(minAddress).parse()).toMatchObject(minAddress.parse())

    // Ignore Case
    expect(new Address(MAX_ADDRESS).localeCompare(`${MAX_ADDRESS.number}, ${MAX_ADDRESS.street} (${MAX_ADDRESS.complement}), ${MAX_ADDRESS.district}, ${MAX_ADDRESS.city}, ${MAX_ADDRESS.state}, ${MAX_ADDRESS.postalCode}, ${MAX_ADDRESS.country}`.toUpperCase(), undefined, { sensitivity: 'accent' }) === 0).toBeTruthy()
  })
})

describe('Methods', () => {
  test('Given that one wants to parse a address', () => {
    const parsedMinAddress = new Address(MIN_ADDRESS).parse()

    expect(parsedMinAddress).toBeDefined()
    expect(parsedMinAddress?.city).toBe(MIN_ADDRESS.city)
    expect(parsedMinAddress?.country).toBe(MIN_ADDRESS.country)
    expect(parsedMinAddress?.postalCode).toBe(MIN_ADDRESS.postalCode)
    expect(parsedMinAddress?.state).toBe(MIN_ADDRESS.state)
    expect(parsedMinAddress?.street).toBe(MIN_ADDRESS.street)

    const parsedMaxAddress = new Address(MAX_ADDRESS).parse()

    expect(parsedMaxAddress).toBeDefined()
    expect(parsedMaxAddress?.city).toBe(MAX_ADDRESS.city)
    expect(parsedMaxAddress?.complement).toBe(MAX_ADDRESS.complement)
    expect(parsedMaxAddress?.country).toBe(MAX_ADDRESS.country)
    expect(parsedMaxAddress?.district).toBe(MAX_ADDRESS.district)
    expect(parsedMaxAddress?.number).toBe(MAX_ADDRESS.number)
    expect(parsedMaxAddress?.postalCode).toBe(MAX_ADDRESS.postalCode)
    expect(parsedMaxAddress?.state).toBe(MAX_ADDRESS.state)
    expect(parsedMaxAddress?.street).toBe(MAX_ADDRESS.street)
  })

  test('Given that one wants to verify a address with invalid arguments', () => {
    INVALID_ADDRESSES.forEach(address => {
      expect(Address.verify(address)).toBeFalsy()
    })

    expect(Address.verify('')).toBeFalsy()
    expect(() => Address.verify({})).toThrow(AggregateError)

    expect(Address.verify({
      ...MAX_ADDRESS,
      city: ''
    })).toBeFalsy()
    expect(Address.verify({
      ...MAX_ADDRESS,
      country: ''
    })).toBeFalsy()
    expect(Address.verify({
      ...MAX_ADDRESS,
      postalCode: ''
    })).toBeFalsy()
    expect(Address.verify({
      ...MAX_ADDRESS,
      state: ''
    })).toBeFalsy()
    expect(Address.verify({
      ...MAX_ADDRESS,
      street: ''
    })).toBeFalsy()

    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => Address.verify(input)).toThrowError(new TypeError('Invalid address'))
    })

    const invalidInputTypesForOptionalFields = INVALID_INPUT_TYPES.filter(input => typeof input !== 'undefined')
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => Address.verify({
        ...MAX_ADDRESS,
        city: input
      })).toThrowError(new TypeError('Invalid city'))
    })
    invalidInputTypesForOptionalFields.forEach(input => {
      expect(() => Address.verify({
        ...MAX_ADDRESS,
        complement: input
      })).toThrowError(new TypeError('Invalid complement'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => Address.verify({
        ...MAX_ADDRESS,
        country: input
      })).toThrowError(new TypeError('Invalid country'))
    })
    invalidInputTypesForOptionalFields.forEach(input => {
      expect(() => Address.verify({
        ...MAX_ADDRESS,
        district: input
      })).toThrowError(new TypeError('Invalid district'))
    })
    invalidInputTypesForOptionalFields.filter(input => !Number.isFinite(input)).forEach(input => {
      expect(() => Address.verify({
        ...MAX_ADDRESS,
        number: input
      })).toThrowError(new TypeError('Invalid number'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => Address.verify({
        ...MAX_ADDRESS,
        postalCode: input
      })).toThrowError(new TypeError('Invalid postalCode'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => Address.verify({
        ...MAX_ADDRESS,
        state: input
      })).toThrowError(new TypeError('Invalid state'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => Address.verify({
        ...MAX_ADDRESS,
        street: input
      })).toThrowError(new TypeError('Invalid street'))
    })

    expect(() => Address.verify({
      city: INVALID_INPUT_TYPES[Math.floor(Math.random() * INVALID_INPUT_TYPES.length)],
      complement: invalidInputTypesForOptionalFields[Math.floor(Math.random() * invalidInputTypesForOptionalFields.length)],
      country: INVALID_INPUT_TYPES[Math.floor(Math.random() * INVALID_INPUT_TYPES.length)],
      district: invalidInputTypesForOptionalFields[Math.floor(Math.random() * invalidInputTypesForOptionalFields.length)],
      number: invalidInputTypesForOptionalFields.filter(input => !Number.isFinite(input))[Math.floor(Math.random() * invalidInputTypesForOptionalFields.filter(input => !Number.isFinite(input)).length)],
      postalCode: INVALID_INPUT_TYPES[Math.floor(Math.random() * INVALID_INPUT_TYPES.length)],
      state: INVALID_INPUT_TYPES[Math.floor(Math.random() * INVALID_INPUT_TYPES.length)],
      street: INVALID_INPUT_TYPES[Math.floor(Math.random() * INVALID_INPUT_TYPES.length)]
    })).toThrow(AggregateError)
  })

  test('Given that one wants to verify a address with valid arguments', () => {
    VALID_ADDRESSES.forEach(address => {
      expect(Address.verify(address)).toBeTruthy()
    })

    expect(Address.verify(MIN_ADDRESS)).toBeTruthy()
    expect(Address.verify(MAX_ADDRESS)).toBeTruthy()
  })
})
