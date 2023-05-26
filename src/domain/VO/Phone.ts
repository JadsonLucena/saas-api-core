// https://www.rfc-editor.org/rfc/rfc2806
// https://www.rfc-editor.org/rfc/rfc3966

type PhoneDTO = {
  country: string,
  area: number,
  number: string
}

export default class Phone extends String {
  private static readonly pattern = /^\s*(?<country>(?:\+\s*)?(?:\d{1,2}\s*-\s*)?\d{1,3})(?:\s+|\s*\(\s*)(?<area>\d{1,3})(?:\s+|\s*\)\s*)(?<number>(?:\d\s*)?\d{3,4}(?:\s+|\s*-\s*)?\d{4})\s*$/

  constructor (phone: String | PhoneDTO) {
    if (!Phone.verify(phone)) {
      throw new TypeError('Invalid phone')
    }

    if (
      phone instanceof String ||
      typeof phone === 'string'
    ) {
      phone = Phone.parse(phone) as PhoneDTO
    }

    super(Phone.stringify(phone))

    Object.freeze(this)
  }

  private static stringify (phone: PhoneDTO) {
    const number = phone.number.replace(/\D/g, '')

    return `+${phone.country.replace('+', '').replaceAll(' ', '')} (${phone.area}) ${number.slice(0, -4)}-${number.slice(-4)}`
  }

  private static parse (phone: String) {
    const parsed = phone.match(Phone.pattern)?.groups as { [key: string]: string }

    return !parsed
      ? undefined
      : {
          country: parsed.country,
          area: Number(parsed.area),
          number: parsed.number
        }
  }

  parse = () => {
    return Phone.parse(this) as PhoneDTO
  }

  static verify (phone: String | PhoneDTO) {
    if (
      typeof phone === 'object' &&
      !(phone instanceof String) &&
      phone !== null &&
      !Array.isArray(phone)
    ) {
      const errors: TypeError[] = []

      if (typeof phone.country !== 'string') {
        errors.push(new TypeError('Invalid country'))
      }
      if (
        !Number.isSafeInteger(phone.area) ||
        phone.area < 0
      ) {
        errors.push(new TypeError('Invalid area'))
      }
      if (typeof phone.number !== 'string') {
        errors.push(new TypeError('Invalid number'))
      }

      if (errors.length > 1) {
        throw new AggregateError(errors, 'Invalid phone')
      } else if (errors.length === 1) {
        throw errors.pop()
      }

      phone = Phone.stringify(phone)
    } else if (
      !(phone instanceof String) &&
      typeof phone !== 'string'
    ) {
      throw new TypeError('Invalid phone')
    }

    const parsedPhone = Phone.parse(phone)

    return (
      !!parsedPhone &&
      !/^\b(\d+)\1+\b$/.test(parsedPhone.number.replace(/\D/g, '')) // ignore repeated numbers
    )
  }
}
