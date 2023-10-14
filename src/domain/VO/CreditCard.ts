// https://www.iso.org/obp/ui/#iso:std:iso-iec:7812:-1:dis:ed-5:v1:en
// https://www.ibm.com/docs/en/order-management-sw/9.3.0?topic=solution-handling-credit-cards

export type CreditCardDTO = {
  holderName: string,
  number: string,
  expiration: string,
  cvc: number
}

export default class CreditCard extends String {
  private static readonly pattern = /^\p{Z}*(?<holderName>[\p{L}\p{P}][\p{Z}\p{L}\p{P}]*[\p{L}\p{P}])\p{Z}+(?<number>[-\p{Z}\p{N}]*)\p{Z}+(?<expiration>(?:\p{N}{2}|\p{N}{4})\/\p{N}{2})\p{Z}+(?<cvc>\p{N}{3,4})\p{Z}*$/iu

  // https://www.bincodes.com/bin-list/
  private static readonly brands: { [key: string]: RegExp } = { // Sort expressions from most specific to most generic
    MASTERCARD: /^((222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[0-1]\d|2720)\d{12}|5[1-5]\d{14})$/, // https://developer.mastercard.com/bin-lookup/documentation/
    MAESTRO: /^(6390|67\d{2})\d{8,15}$/, // https://developer.mastercard.com/bin-lookup/documentation/
    AMERICAN_EXPRESS: /^3[47]\d{13}$/, // https://www.americanexpress.com/content/dam/amex/hk/en/staticassets/merchant/pdf/support-and-services/useful-information-and-downloads/GuidetoCheckingCardFaces.pdf
    VISA: /^4\d{13,20}$/, // https://developer.visa.com/capabilities/visa-bin-attribute-sharing-service/reference#tag/Single-BIN-Lookup/operation/PAN%20TOKEN%20Lookup%20Using%20POST%20V2_v2%20-%20Latest!path=requestData/paymentAccount&t=request

    DISCOVER: /^((622(1(2[6-9]|[3-9][0-9])|[2-8][0-9]{2}|9([0-1][0-9]|2[0-5])))\d{10,13}|6011\d{12,15}|64[4-9]\d{13,16}|65\d{14,17}|5\d{15,18})$/, // https://www.discoverglobalnetwork.com/content/dam/discover/en_us/dgn/docs/IPP-VAR-Enabler-Compliance.pdf
    // DINERS_CLUB: /^(3095\d{12,15}|30[0-5]\d{13,16}|3(6|[8-9])\d{14,17}|5[45]\d{14})$/,
    // UNIONPAY: /^(62|81)\d{14,17}$/,
    // JCB: /^(2131|1800|35\d{3})\d{11}$/,
    // BC: /^\d+$/,

    ELO: /^(451416|50670[7-8]|506715|5067(1[7-9]|2[0-2])|5067(2[4-9]|3[0-6])|5067(39|4[0-8])|506753|50677[4-8]|5090(0[0-9]|1[0-4])|5090[2-8]\d|509(09[1-9]|10[0-1])|509(10[3-9]|1[1-9]\d|[2-7]\d{2}|80[0-7])|5098(3[1-9]|[4-6]\d|7[0-7])|509(89[7-9]|900)|5099(1[8-9]|[2-5]\d|6[0-4])|5099(7[1-9]|8[0-6])|50999[5-9]|627780|636297|636368|65003[1-3]|6500(3[5-9]|4\d|5[0-1])|6500(5[7-9]|[6-7][0-9]|8[0-1])|6504(0[6-9]|[1-3]\d)|650(48[5-9]|49[0-9]|50[0-4])|6505(0[6-9]|[1-2]\d|3[0-8])|6505(5[2-9]|[6-8]\d|9[0-8])|65072[0-7]|6509(0[1-9]|1\d|2[0-2])|650928|65093[8-9]|6509(4[6-9]|[5-6]\d|7[0-8])|651(65[2-9]|6[6-9]\d|70[0-4])|6550[0-1]\d|6550(2[1-9]|[3-4]\d|5[0-7]))\d{10}$/ // https://dev.elo.com.br/documentacao/tabela-de-bins/latest#tabela-de-bins-ou-download-csv
    // HIPERCARD: /^(3841\d{2}|60\d{2})\d{12}(\d{3})?$/,
    // HIPER: /^(606282|3841)\d{10}$/,

    // LASER: /^(6304|6706|6771|6709)\d{12}(\d{2,3})?$/,
    // UKRCARD: /^(6040|6042|6044|6046|6047|6048|6049|6060|6061|6062|6063|6064|6065|6066|6067|6068|6069|6070|6071|6072|6073|6074|6075|6076|6077|6078|6079|6080|6081|6082|6083|6084|6085|6086|6087|6088|6089|6090|6091|6092|6093|6094|6095|6096|6097|6098|6099)\d{10}$/,
    // VERVE: /^(5060|5061|5062|5063|5064|5065|5066|5067|5068|5069)\d{12}$/,
    // HUMO: /^(8600|9860)\d{12}$/,
    // DANKORT: /^(4571|5019)\d{12}$/,
    // MIR: /^220\d{13}$/,
    // RUPAY: /^6\d{15}$/,
    // TROY: /^(9[0-9]{15})$/,
    // UATP: /^1\d{14}$/,
    // T_UNION: /^31\d{17}$/,
    // UZCARD: /^860\d{14}$/,
    // AURA: /^4\d{15}$/,
    // CARTE_BANCAIRE: /^4\d{15}$/
  }

  constructor (creditCard: String | CreditCardDTO) {
    if (!CreditCard.verify(creditCard)) {
      throw new TypeError('Invalid creditCard')
    }

    if (
      (creditCard instanceof String) ||
      typeof creditCard === 'string'
    ) {
      creditCard = CreditCard.parse(creditCard) as CreditCardDTO
    }

    super(CreditCard.stringify(creditCard))

    Object.freeze(this)
  }

  private static stringify (creditCard: CreditCardDTO) {
    return `${creditCard.holderName} ${creditCard.number.replaceAll(' ', '')} ${creditCard.expiration} ${creditCard.cvc}`.normalize('NFC').replace(/\s{2,}/g, ' ').trim()
  }

  private static parse (creditCard: String) {
    const parsed = creditCard.match(CreditCard.pattern)?.groups

    return !parsed
      ? undefined
      : {
          holderName: parsed.holderName,
          number: parsed.number.replaceAll(' ', ''),
          expiration: parsed.expiration,
          cvc: Number(parsed.cvc),
          brand: Object.keys(CreditCard.brands).find(brand => CreditCard.brands[brand].test(parsed.number.replaceAll(' ', '')))
        }
  }

  parse = () => {
    return CreditCard.parse(this) as CreditCardDTO & { brand?: string }
  }

  static verify (creditCard: String | CreditCardDTO) {
    if (
      typeof creditCard === 'object' &&
      !(creditCard instanceof String) &&
      creditCard !== null &&
      !Array.isArray(creditCard)
    ) {
      const errors: TypeError[] = []

      if (typeof creditCard.holderName !== 'string') {
        errors.push(new TypeError('Invalid holderName'))
      }
      if (typeof creditCard.number !== 'string') {
        errors.push(new TypeError('Invalid number'))
      }
      if (typeof creditCard.expiration !== 'string') {
        errors.push(new TypeError('Invalid expiration'))
      }
      if (
        !Number.isFinite(creditCard.cvc) ||
        creditCard.cvc < 0
      ) {
        errors.push(new TypeError('Invalid cvc'))
      }

      if (errors.length > 1) {
        throw new AggregateError(errors, 'Invalid creditCard')
      } else if (errors.length === 1) {
        throw errors.pop()
      }

      creditCard = CreditCard.stringify(creditCard)
    } else if (
      !(creditCard instanceof String) &&
      typeof creditCard !== 'string'
    ) {
      throw new TypeError('Invalid creditCard')
    }

    const parsedCreditCard = CreditCard.parse(creditCard)

    if (
      !parsedCreditCard ||
      !/^\d{12,19}$/.test(parsedCreditCard.number) ||
      !CreditCard.isLuhnValid(parsedCreditCard.number)
    ) {
      return false
    }

    const expiration = new Date(
      Number(parsedCreditCard.expiration.split('/')[0].padStart(
        4,
        new Date().getFullYear().toString().substring(0, 2)
      )),
      Number(parsedCreditCard.expiration.split('/')[1]),
      0,
      23,
      59,
      59,
      999
    )

    if (expiration.getTime() < new Date().getTime()) {
      throw new RangeError('Invalid expiration')
    }

    return true
  }

  private static isLuhnValid (cardNumber: string) {
    cardNumber = cardNumber.replace(/\D/g, '')

    let sum = 0

    cardNumber.split('').reverse().forEach((digit, i) => {
      let number = parseInt(digit)

      if (i % 2) {
        number *= 2

        if (number > 9) {
          sum -= 9
        }
      }

      sum += number
    })

    return sum % 10 === 0
  }
}
