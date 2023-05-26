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

    expect(() => new Address(Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      city: ''
    }))).toThrowError(new TypeError('Invalid address'))
    expect(() => new Address(Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      country: ''
    }))).toThrowError(new TypeError('Invalid address'))
    expect(() => new Address(Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      postalCode: ''
    }))).toThrowError(new TypeError('Invalid address'))
    expect(() => new Address(Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      state: ''
    }))).toThrowError(new TypeError('Invalid address'))
    expect(() => new Address(Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      street: ''
    }))).toThrowError(new TypeError('Invalid address'))

    INVALID_INPUT_TYPES.forEach(address => {
      expect(() => new Address(address)).toThrowError(new TypeError('Invalid address'))
    })

    const invalidInputTypesForOptionalFields = INVALID_INPUT_TYPES.filter(input => typeof input !== 'undefined')
    INVALID_INPUT_TYPES.map(input => Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      city: input
    })).forEach(input => {
      expect(() => new Address(input)).toThrowError(new TypeError('Invalid city'))
    })
    invalidInputTypesForOptionalFields.map(input => Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      complement: input
    })).forEach(input => {
      expect(() => new Address(input)).toThrowError(new TypeError('Invalid complement'))
    })
    INVALID_INPUT_TYPES.map(input => Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      country: input
    })).forEach(input => {
      expect(() => new Address(input)).toThrowError(new TypeError('Invalid country'))
    })
    invalidInputTypesForOptionalFields.map(input => Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      district: input
    })).forEach(input => {
      expect(() => new Address(input)).toThrowError(new TypeError('Invalid district'))
    })
    invalidInputTypesForOptionalFields.filter(input => !Number.isFinite(input)).map(input => Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      number: input
    })).forEach(input => {
      expect(() => new Address(input)).toThrowError(new TypeError('Invalid number'))
    })
    INVALID_INPUT_TYPES.map(input => Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      postalCode: input
    })).forEach(input => {
      expect(() => new Address(input)).toThrowError(new TypeError('Invalid postalCode'))
    })
    INVALID_INPUT_TYPES.map(input => Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      state: input
    })).forEach(input => {
      expect(() => new Address(input)).toThrowError(new TypeError('Invalid state'))
    })
    INVALID_INPUT_TYPES.map(input => Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      street: input
    })).forEach(input => {
      expect(() => new Address(input)).toThrowError(new TypeError('Invalid street'))
    })

    expect(() => new Address({
      city: INVALID_INPUT_TYPES[Math.floor(Math.random() * invalidInputTypesForOptionalFields.length)],
      complement: invalidInputTypesForOptionalFields[Math.floor(Math.random() * invalidInputTypesForOptionalFields.length)],
      country: INVALID_INPUT_TYPES[Math.floor(Math.random() * invalidInputTypesForOptionalFields.length)],
      district: invalidInputTypesForOptionalFields[Math.floor(Math.random() * invalidInputTypesForOptionalFields.length)],
      number: invalidInputTypesForOptionalFields.filter(input => !Number.isFinite(input))[Math.floor(Math.random() * invalidInputTypesForOptionalFields.filter(input => !Number.isFinite(input)).length)],
      postalCode: INVALID_INPUT_TYPES[Math.floor(Math.random() * invalidInputTypesForOptionalFields.length)],
      state: INVALID_INPUT_TYPES[Math.floor(Math.random() * invalidInputTypesForOptionalFields.length)],
      street: INVALID_INPUT_TYPES[Math.floor(Math.random() * invalidInputTypesForOptionalFields.length)]
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
    expect(MIN_ADDRESS.city).toBe(parsedMinAddress?.city)
    expect(MIN_ADDRESS.country).toBe(parsedMinAddress?.country)
    expect(MIN_ADDRESS.postalCode).toBe(parsedMinAddress?.postalCode)
    expect(MIN_ADDRESS.state).toBe(parsedMinAddress?.state)
    expect(MIN_ADDRESS.street).toBe(parsedMinAddress?.street)

    const parsedMaxAddress = new Address(MAX_ADDRESS).parse()

    expect(parsedMaxAddress).toBeDefined()
    expect(MAX_ADDRESS.city).toBe(parsedMaxAddress?.city)
    expect(MAX_ADDRESS.complement).toBe(parsedMaxAddress?.complement)
    expect(MAX_ADDRESS.country).toBe(parsedMaxAddress?.country)
    expect(MAX_ADDRESS.district).toBe(parsedMaxAddress?.district)
    expect(MAX_ADDRESS.number).toBe(parsedMaxAddress?.number)
    expect(MAX_ADDRESS.postalCode).toBe(parsedMaxAddress?.postalCode)
    expect(MAX_ADDRESS.state).toBe(parsedMaxAddress?.state)
    expect(MAX_ADDRESS.street).toBe(parsedMaxAddress?.street)
  })

  test('Given that one wants to verify address with invalid arguments', () => {
    INVALID_ADDRESSES.forEach(address => {
      expect(Address.verify(address)).toBeFalsy()
    })

    expect(Address.verify('')).toBeFalsy()
    expect(() => Address.verify({})).toThrow(AggregateError)

    expect(Address.verify(Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      city: ''
    }))).toBeFalsy()
    expect(Address.verify(Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      country: ''
    }))).toBeFalsy()
    expect(Address.verify(Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      postalCode: ''
    }))).toBeFalsy()
    expect(Address.verify(Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      state: ''
    }))).toBeFalsy()
    expect(Address.verify(Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      street: ''
    }))).toBeFalsy()

    INVALID_INPUT_TYPES.forEach(address => {
      expect(() => Address.verify(address)).toThrowError(new TypeError('Invalid address'))
    })

    const invalidInputTypesForOptionalFields = INVALID_INPUT_TYPES.filter(input => typeof input !== 'undefined')
    INVALID_INPUT_TYPES.map(input => Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      city: input
    })).forEach(input => {
      expect(() => Address.verify(input)).toThrowError(new TypeError('Invalid city'))
    })
    invalidInputTypesForOptionalFields.map(input => Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      complement: input
    })).forEach(address => {
      expect(() => Address.verify(address)).toThrowError(new TypeError('Invalid complement'))
    })
    INVALID_INPUT_TYPES.map(input => Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      country: input
    })).forEach(address => {
      expect(() => Address.verify(address)).toThrowError(new TypeError('Invalid country'))
    })
    invalidInputTypesForOptionalFields.map(input => Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      district: input
    })).forEach(address => {
      expect(() => Address.verify(address)).toThrowError(new TypeError('Invalid district'))
    })
    invalidInputTypesForOptionalFields.filter(input => !Number.isFinite(input)).map(input => Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      number: input
    })).forEach(address => {
      expect(() => Address.verify(address)).toThrowError(new TypeError('Invalid number'))
    })
    INVALID_INPUT_TYPES.map(input => Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      postalCode: input
    })).forEach(address => {
      expect(() => Address.verify(address)).toThrowError(new TypeError('Invalid postalCode'))
    })
    INVALID_INPUT_TYPES.map(input => Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      state: input
    })).forEach(address => {
      expect(() => Address.verify(address)).toThrowError(new TypeError('Invalid state'))
    })
    INVALID_INPUT_TYPES.map(input => Object.assign(JSON.parse(JSON.stringify(MAX_ADDRESS)), {
      street: input
    })).forEach(address => {
      expect(() => Address.verify(address)).toThrowError(new TypeError('Invalid street'))
    })

    expect(() => Address.verify({
      city: INVALID_INPUT_TYPES[Math.floor(Math.random() * invalidInputTypesForOptionalFields.length)],
      complement: invalidInputTypesForOptionalFields[Math.floor(Math.random() * invalidInputTypesForOptionalFields.length)],
      country: INVALID_INPUT_TYPES[Math.floor(Math.random() * invalidInputTypesForOptionalFields.length)],
      district: invalidInputTypesForOptionalFields[Math.floor(Math.random() * invalidInputTypesForOptionalFields.length)],
      number: invalidInputTypesForOptionalFields.filter(input => !Number.isFinite(input))[Math.floor(Math.random() * invalidInputTypesForOptionalFields.filter(input => !Number.isFinite(input)).length)],
      postalCode: INVALID_INPUT_TYPES[Math.floor(Math.random() * invalidInputTypesForOptionalFields.length)],
      state: INVALID_INPUT_TYPES[Math.floor(Math.random() * invalidInputTypesForOptionalFields.length)],
      street: INVALID_INPUT_TYPES[Math.floor(Math.random() * invalidInputTypesForOptionalFields.length)]
    })).toThrow(AggregateError)
  })

  test('Given that one wants to verify address with valid arguments', () => {
    VALID_ADDRESSES.forEach(address => {
      expect(Address.verify(address)).toBeTruthy()
    })

    expect(Address.verify(MIN_ADDRESS)).toBeTruthy()
    expect(Address.verify(MAX_ADDRESS)).toBeTruthy()
  })
})
