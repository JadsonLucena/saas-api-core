type nameDTO = {
  firstName: string,
  lastName?: string
}

export default class Name extends String {
  private static readonly pattern = /^\p{Z}*(?<firstName>[\p{L}\p{P}]+)(?:\p{Z}+(?<lastName>[\p{L}\p{P}](?:[\p{Z}\p{L}\p{P}]*[\p{L}\p{P}])?))?\p{Z}*$/iu

  constructor (name: String | nameDTO, {
    minLength,
    maxLength,
    minAmountOfLastNames
  }: {
    minLength?: number,
    maxLength?: number,
    minAmountOfLastNames?: number
  } = {}) {
    if (!Name.verify(name, {
      minLength,
      maxLength,
      minAmountOfLastNames
    })) {
      throw new TypeError('Invalid name')
    }

    super(Name.stringify(name))

    Object.freeze(this)
  }

  private static stringify (name: String | nameDTO) {
    if (
      !(name instanceof String) &&
      typeof name !== 'string'
    ) {
      let formattedName = name.firstName

      if (name.lastName) {
        formattedName += ` ${name.lastName}`
      }

      name = formattedName
    }

    return name.normalize('NFC').replace(/\s{2,}/g, ' ').trim()
  }

  private static parse (name: String) {
    return name.match(Name.pattern)?.groups
  }

  parse = (): nameDTO => {
    return Name.parse(this) as nameDTO
  }

  static verify (name: String | nameDTO, {
    minLength = 1,
    maxLength = 256,
    minAmountOfLastNames = 1
  }: {
    minLength?: number,
    maxLength?: number,
    minAmountOfLastNames?: number
  } = {}) {
    if (
      typeof name === 'object' &&
      !(name instanceof String) &&
      name !== null &&
      !Array.isArray(name)
    ) {
      const errors: TypeError[] = []

      if (typeof name.firstName !== 'string') {
        errors.push(new TypeError('Invalid firstName'))
      }
      if (
        typeof name.lastName !== 'undefined' &&
        typeof name.lastName !== 'string'
      ) {
        errors.push(new TypeError('Invalid lastName'))
      }

      if (errors.length > 1) {
        throw new AggregateError(errors, 'Invalid name')
      } else if (errors.length === 1) {
        throw errors.pop()
      }

      name = Name.stringify(name)
    } else if (
      !(name instanceof String) &&
      typeof name !== 'string'
    ) {
      throw new TypeError('Invalid name')
    }

    const errors: SyntaxError[] = []
    if (
      !Number.isSafeInteger(minLength) ||
      minLength < 1
    ) {
      errors.push(new SyntaxError('Invalid minLength'))
    }
    if (
      !Number.isSafeInteger(maxLength) ||
      maxLength < 1 ||
      (
        Number.isSafeInteger(minLength) &&
        maxLength < minLength
      )
    ) {
      errors.push(new SyntaxError('Invalid maxLength'))
    }
    if (
      !Number.isSafeInteger(minAmountOfLastNames) ||
      minAmountOfLastNames < 0
    ) {
      errors.push(new SyntaxError('Invalid minAmountOfLastNames'))
    }

    if (errors.length > 1) {
      throw new AggregateError(errors, 'Invalid settings')
    } else if (errors.length === 1) {
      throw errors.pop()
    }

    const parsedName = Name.parse(name)

    return (
      name.length >= minLength &&
      name.length <= maxLength &&
      (!!parsedName && (parsedName?.lastName?.split(' ')?.length || 0) >= minAmountOfLastNames)
    )
  }
}
