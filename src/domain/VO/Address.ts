export type addressDTO = {
  city: string,
  complement?: string,
  country: string,
  district?: string,
  number?: number,
  postalCode: string,
  state: string,
  street: string
}

export default class Address extends String {
  private static readonly pattern = /^\p{Z}*(?:(?<number>\p{N}[\p{N}.]*\p{N})\p{Z}*,\p{Z}*)?(?<street>[\p{L}\p{N}\p{P}](?<![,(])(?:(?:[\p{Z}\p{L}\p{N}\p{P}](?<![,(]))*[\p{L}\p{N}\p{P}](?<![,(]))?)(?:\p{Z}*\u0028\p{Z}*(?<complement>[\p{L}\p{N}\p{P}](?:[\p{Z}\p{L}\p{N}\p{P}]*[\p{L}\p{N}\p{P}])?)\p{Z}*\u0029)?\p{Z}*,\p{Z}*(?:(?<district>[\p{L}\p{N}\p{P}](?<!,)(?:(?:[\p{Z}\p{L}\p{N}\p{P}](?<!,))*[\p{L}\p{N}\p{P}](?<!,))?)\p{Z}*,\p{Z}*)?(?<city>[\p{L}\p{P}](?<!,)(?:(?:[\p{Z}\p{L}\p{P}](?<!,))*[\p{L}\p{P}](?<!,))?)\p{Z}*,\p{Z}*(?<state>[\p{L}\p{P}](?<!,)(?:(?:[\p{Z}\p{L}\p{P}](?<!,))*[\p{L}\p{P}](?<!,))?)\p{Z}*,\p{Z}*(?<postalCode>(?:[\p{N}\p{L}\p{P}](?<!,))+)\p{Z}*,\p{Z}*(?<country>[\p{L}\p{P}](?<!,)(?:(?:[\p{Z}\p{L}\p{P}](?<!,))*[\p{L}\p{P}](?<!,))?)\p{Z}*$/iu

  constructor (address: String | addressDTO) {
    if (!Address.verify(address)) {
      throw new TypeError('Invalid address')
    }

    if (
      (address instanceof String) ||
      typeof address === 'string'
    ) {
      address = Address.parse(address) as addressDTO
    }

    super(Address.stringify(address))

    Object.freeze(this)
  }

  private static stringify (address: addressDTO) {
    let formattedAddress = Number.isFinite(address.number) ? `${address.number}, ` : ''

    formattedAddress += address.street

    if (address.complement) {
      formattedAddress += ` (${address.complement})`
    }

    if (address.district) {
      formattedAddress += `, ${address.district}`
    }

    formattedAddress += `, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}`

    return formattedAddress.normalize('NFC').replace(/\s{2,}/g, ' ').trim()
  }

  private static parse (address: String) {
    const parsed = address.match(Address.pattern)?.groups

    return {
      city: parsed!.city,
      complement: parsed?.complement,
      country: parsed!.country,
      district: parsed?.district,
      number: parsed?.number ? Number(parsed.number) : undefined,
      postalCode: parsed!.postalCode,
      state: parsed!.state,
      street: parsed!.street
    }
  }

  parse = () => {
    return Address.parse(this) as addressDTO
  }

  static verify (address: String | addressDTO) {
    if (
      typeof address === 'object' &&
      !(address instanceof String) &&
      address !== null &&
      !Array.isArray(address)
    ) {
      const errors: TypeError[] = []

      if (typeof address.city !== 'string') {
        errors.push(new TypeError('Invalid city'))
      }
      if (
        typeof address.complement !== 'undefined' &&
        typeof address.complement !== 'string'
      ) {
        errors.push(new TypeError('Invalid complement'))
      }
      if (typeof address.country !== 'string') {
        errors.push(new TypeError('Invalid country'))
      }
      if (
        typeof address.district !== 'undefined' &&
        typeof address.district !== 'string'
      ) {
        errors.push(new TypeError('Invalid district'))
      }
      if (
        typeof address.number !== 'undefined' && (
          !Number.isFinite(address.number) ||
          address.number < 0
        )
      ) {
        errors.push(new TypeError('Invalid number'))
      }
      if (typeof address.postalCode !== 'string') {
        errors.push(new TypeError('Invalid postalCode'))
      }
      if (typeof address.state !== 'string') {
        errors.push(new TypeError('Invalid state'))
      }
      if (typeof address.street !== 'string') {
        errors.push(new TypeError('Invalid street'))
      }

      if (errors.length > 1) {
        throw new AggregateError(errors, 'Invalid address')
      } else if (errors.length === 1) {
        throw errors.pop()
      }

      address = Address.stringify(address)
    } else if (
      !(address instanceof String) &&
      typeof address !== 'string'
    ) {
      throw new TypeError('Invalid address')
    }

    return Address.pattern.test(address as string)
  }
}
