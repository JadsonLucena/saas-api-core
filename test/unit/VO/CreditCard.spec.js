import CreditCard from '../../../build/domain/VO/CreditCard.js'

const date = new Date()

const VALID_CREDIT_CARD_NUMBERS = {
  AMERICAN_EXPRESS: [
    '3702 1200 9696 751',
    '3443 7182 7763 137',
    '3430 4089 4948 464',
    '3714 6082 9151 304',
    '3489 4705 9809 767',
    '3446 5046 1957 968',
    '3725 7420 9086 457',
    '3775 2363 9903 067',
    '3480 5551 1955 259',
    '3467 5942 4268 179'
  ]
  /* AURA: [
    '5078603166198645',
    '5078603050723979',
    '5078602625629331',
    '5078607213200601',
    '5078606880781471',
    '5078601624747102',
    '5078607236464002',
    '5078606947905980',
    '5078607667958944',
    '5078606372938662'
  ],
  CARTE_BANCAIRE: [

  ],
  DANKORT: [
    '5019 7148 4453 8813',
    '5019 5071 3608 3856',
    '5019 5673 4410 7616',
    '5019 6188 7632 8276',
    '5019 5214 4562 6487',
    '5019 3883 1855 7870',
    '5019 7217 2724 4633',
    '5019 3580 6506 7407',
    '5019 1220 2380 5716',
    '5019 2202 0136 0460'
  ],
  DINERS_CLUB: [

  ],
  DISCOVER: [

  ],
  ELO: [
    '5067 2751 8753 7763', // Banco do Brasil
    '5067-2689-0495-3884', // HSBC
    '5067-4411-4219-8428', // Banco J Safra S/A
    '5067-3643-4393-2470', // Banco Itaú
    '4390-8667-8590-2846',
    '5067-1872-8614-0342',
    '5067-1319-3460-7930',
    '5067-2579-6820-1371',
    '5067-2789-1871-4487',
    '5067-4311-3919-5057'
  ],
  HIPER: [

  ],
  HIPERCARD: [

  ],
  JCB: [
    '3523 7272 4555 2740',
    '3528 3633 7688 6411',
    '3529 5677 7647 2312',
    '3530 7862 0763 3303',
    '3538 4754 5835 5848',
    '3588 1311 0116 8521',
    '3589 2550 6312 5002',
    '3572-2947-4678-1484',
    '3572-7160-2346-3717',
    '3572-8320-6186-8103'
  ],
  LASER: [

  ],
  MAESTRO: [
    '6762 0874 6658',
    '5893 0002 1133 7',
    '6762 0264 5380 13',
    '5020 0630 0136 033',
    '6762 2415 6728 2186',
    '6761 8493 5988 0240 3',
    '5038 6387 1028 8801 21',
    '6759 1100 0885 0013 876',
    '6763 0588 8495 6618',
    '5020 8927 4677 4079'
  ],
  MASTERCARD: [
    '5308-8498-3302-2302',
    '5305-2739-5845-2504',
    '5354-6384-6760-6883',
    '5346-4237-7902-0987',
    '5378-8887-9191-6035',
    '5345-3791-9157-1737',
    '5327-6408-6760-3738',
    '5304-7480-7081-8048',
    '5392-3154-8006-1651',
    '5378-7207-4304-0871'
  ],
  MIR: [
    '2200 9703 0456 2067',
    '2201 0781 2551 6467',
    '2203 0298 7969 5963',
    '2204 4848 3694 4922',
    '2200 9993 1742 8300 3',
    '2204 3582 1501 6122 2',
    '2200 6803 5962 1145 90',
    '2204 0834 9408 2246 76',
    '2200 0691 9683 0577 472',
    '2203 4299 3799 2923 510'
  ],
  RUPAY: [
    '5083 9940 5940 9469',
    '8238 9706 3143 3944',
    '8191 0504 1682 7639',
    '8277 4602 5932 5053',
    '6557 4042 5674 2972',
    '8160 6623 4819 6425',
    '8168 7094 6207 0290',
    '8108 3512 6867 4117',
    '6564 6186 2973 2870',
    '8128 2969 1224 8519'
  ],
  UATP: [
    '107 1686 3535 5354',
    '161 2552 2065 1678',
    '176 1878 5437 3761',
    '172 1281 8460 5880',
    '120 2281 5226 6484',
    '106 1455 1657 7786',
    '107 1181 2542 7262',
    '126 8364 8444 4316',
    '124 2714 5723 6758',
    '105 7015 4261 5882'
  ],
  UNIONPAY: [
    '6267 1782 4627 7056',
    '6260 1863 2787 6628',
    '6215 4852 7882 0213',
    '6223 1305 5830 6653',
    '6223 3072 8346 3013',
    '6223 3407 1318 2085',
    '6270 3152 0147 7603',
    '6270 7103 6141 0024',
    '6270 3745 3004 1630'
  ],
  VISA: [
    '4003 9178 8502 4145',
    '4003 9352 6080 0327',
    '4223 9907 0041 6014',
    '4030 7316 8008 7356',
    '4113 5578 8041 8814',
    '4343 5150 5734 1104',
    '4343 8565 3285 0354',
    '4000 5207 3836 5625',
    '4265 1008 6126 6237',
    '4265 0336 2171 5435'
  ],
  VISA_ELECTRON: [
    '4026760190012881',
    '4508678739155838',
    '4508730554089764',
    '4175005489331827',
    '4913641274471282',
    '4026380646567816',
    '4508175446704792',
    '4026421201900073',
    '4508849474160487',
    '4175002152857832  '
  ] */
}
const CREDIT_CARD = {
  holderName: 'John Doe',
  number: VALID_CREDIT_CARD_NUMBERS.AMERICAN_EXPRESS[0],
  expiration: date.toISOString().substring(0, 7).replace('-', '/'),
  cvc: 123
}
const VALID_CREDIT_CARD = [
  Object.values(CREDIT_CARD).join(' '),
  `  ${Object.values(CREDIT_CARD).join('  ')}  `,
  {
    holderName: 'John',
    number: VALID_CREDIT_CARD_NUMBERS.AMERICAN_EXPRESS[0].replace(/\D+/g, ''),
    expiration: date.toISOString().substring(0, 7).replace('-', '/'),
    cvc: 1234
  }
]
const INVALID_CREDIT_CARD = [
  Object.values(CREDIT_CARD).filter((field, i) => i !== 0).join(' '),
  Object.values(CREDIT_CARD).filter((field, i) => i !== 1).join(' '),
  Object.values(CREDIT_CARD).filter((field, i) => i !== 2).join(' '),
  Object.values(CREDIT_CARD).filter((field, i) => i !== 3).join(' '),
  `${Object.values(CREDIT_CARD).join(' ')} anything`
]
const INVALID_INPUT_TYPES = [
  Infinity,
  NaN,
  [],
  {},
  null,
  false
]

describe('Constructor', () => {
  test('Given that one wants to instantiate the object with invalid argument', () => {
    INVALID_CREDIT_CARD.forEach(creditCard => {
      expect(() => new CreditCard(creditCard)).toThrowError(new TypeError('Invalid creditCard'))
    })

    expect(() => new CreditCard('')).toThrowError(new TypeError('Invalid creditCard'))
    expect(() => new CreditCard({})).toThrow(AggregateError)

    expect(() => new CreditCard({
      ...CREDIT_CARD,
      holderName: ''
    })).toThrowError(new TypeError('Invalid creditCard'))
    expect(() => new CreditCard({
      ...CREDIT_CARD,
      number: ''
    })).toThrowError(new TypeError('Invalid creditCard'))
    expect(() => new CreditCard({
      ...CREDIT_CARD,
      expiration: ''
    })).toThrowError(new TypeError('Invalid creditCard'))
    expect(() => new CreditCard({
      ...CREDIT_CARD,
      cvc: 0
    })).toThrowError(new TypeError('Invalid creditCard'))

    INVALID_INPUT_TYPES.concat(0, undefined).forEach(creditCard => {
      expect(() => new CreditCard(creditCard)).toThrowError(new TypeError('Invalid creditCard'))
    })

    INVALID_INPUT_TYPES.concat(0, undefined).forEach(input => {
      expect(() => new CreditCard({
        ...CREDIT_CARD,
        holderName: input
      })).toThrowError(new TypeError('Invalid holderName'))
    })
    INVALID_INPUT_TYPES.concat(0, undefined).forEach(input => {
      expect(() => new CreditCard({
        ...CREDIT_CARD,
        number: input
      })).toThrowError(new TypeError('Invalid number'))
    })
    INVALID_INPUT_TYPES.concat(
      0,
      undefined,
      new Date(new Date().setMonth(date.getMonth() - 1)).toISOString().substring(0, 7).replace('-', '/')
    ).forEach(input => {
      expect(() => new CreditCard({
        ...CREDIT_CARD,
        expiration: input
      })).toThrowError(new TypeError('Invalid expiration'))
    })
    INVALID_INPUT_TYPES.concat('', undefined).forEach(input => {
      expect(() => new CreditCard({
        ...CREDIT_CARD,
        cvc: input
      })).toThrowError(new TypeError('Invalid cvc'))
    })

    expect(() => new CreditCard({
      holderName: INVALID_INPUT_TYPES.concat(0, undefined)[Math.floor(Math.random() * INVALID_INPUT_TYPES.concat(0, undefined).length)],
      number: INVALID_INPUT_TYPES.concat(0, undefined)[Math.floor(Math.random() * INVALID_INPUT_TYPES.concat(0, undefined).length)],
      expiration: INVALID_INPUT_TYPES.concat(0, undefined)[Math.floor(Math.random() * INVALID_INPUT_TYPES.concat(0, undefined).length)],
      cvc: INVALID_INPUT_TYPES.concat('', undefined)[Math.floor(Math.random() * INVALID_INPUT_TYPES.concat('', undefined).length)]
    })).toThrow(AggregateError)
  })

  test('Given that one wants to instantiate the object with a valid argument', () => {
    expect(new CreditCard(CREDIT_CARD).toString()).toBe(`${CREDIT_CARD.holderName} ${CREDIT_CARD.number.replace(/\D+/g, '')} ${CREDIT_CARD.expiration} ${CREDIT_CARD.cvc}`)

    VALID_CREDIT_CARD.forEach(creditCard => {
      expect(() => new CreditCard(creditCard)).not.toThrow()
    })

    const creditCard = new CreditCard(CREDIT_CARD)
    expect(new CreditCard(creditCard).toString()).toBe(creditCard.toString())
    expect(new CreditCard(creditCard).parse()).toMatchObject(creditCard.parse())

    // Ignore Case
    expect(new CreditCard(CREDIT_CARD).localeCompare(`${CREDIT_CARD.holderName} ${CREDIT_CARD.number.replace(/\D+/g, '')} ${CREDIT_CARD.expiration} ${CREDIT_CARD.cvc}`.toUpperCase(), undefined, { sensitivity: 'accent' }) === 0).toBeTruthy()
  })

  test('Given that one wants to check if the brand matches the card code', () => {
    Object.keys(VALID_CREDIT_CARD_NUMBERS).forEach(brand => {
      VALID_CREDIT_CARD_NUMBERS[brand].forEach(number => {
        const creditCard = new CreditCard({
          holderName: 'John Doe',
          number,
          expiration: date.toISOString().substring(0, 7).replace('-', '/'),
          cvc: 123
        })

        expect(creditCard.parse().brand).toBe(brand)
      })
    })
  })
})

describe('Methods', () => {
  test('Given that one wants to parse a credit card', () => {
    const creditCard = new CreditCard(CREDIT_CARD).parse()

    expect(creditCard).toBeDefined()
    expect(creditCard?.holderName).toBe(CREDIT_CARD.holderName)
    expect(creditCard?.number).toBe(CREDIT_CARD.number.replace(/\D+/g, ''))
    expect(creditCard?.expiration).toBe(CREDIT_CARD.expiration)
    expect(creditCard?.cvc).toBe(CREDIT_CARD.cvc)
    expect(creditCard?.brand).toBe('AMERICAN_EXPRESS')
  })

  test('Given that one wants to verify a credit card with invalid arguments', () => {
    INVALID_CREDIT_CARD.forEach(creditCard => {
      expect(CreditCard.verify(creditCard)).toBeFalsy()
    })

    expect(CreditCard.verify('')).toBeFalsy()
    expect(() => CreditCard.verify({})).toThrow(AggregateError)

    expect(CreditCard.verify({
      ...CREDIT_CARD,
      holderName: ''
    })).toBeFalsy()
    expect(CreditCard.verify({
      ...CREDIT_CARD,
      number: ''
    })).toBeFalsy()
    expect(CreditCard.verify({
      ...CREDIT_CARD,
      expiration: ''
    })).toBeFalsy()
    expect(CreditCard.verify({
      ...CREDIT_CARD,
      cvc: 0
    })).toBeFalsy()

    INVALID_INPUT_TYPES.concat(0, undefined).forEach(creditCard => {
      expect(() => CreditCard.verify(creditCard)).toThrowError(new TypeError('Invalid creditCard'))
    })

    INVALID_INPUT_TYPES.concat(0, undefined).forEach(input => {
      expect(() => CreditCard.verify({
        ...CREDIT_CARD,
        holderName: input
      })).toThrowError(new TypeError('Invalid holderName'))
    })
    INVALID_INPUT_TYPES.concat(0, undefined).forEach(input => {
      expect(() => CreditCard.verify({
        ...CREDIT_CARD,
        number: input
      })).toThrowError(new TypeError('Invalid number'))
    })
    INVALID_INPUT_TYPES.concat(
      0,
      undefined,
      new Date(new Date().setMonth(date.getMonth() - 1)).toISOString().substring(0, 7).replace('-', '/')
    ).forEach(input => {
      expect(() => CreditCard.verify({
        ...CREDIT_CARD,
        expiration: input
      })).toThrowError(new TypeError('Invalid expiration'))
    })
    INVALID_INPUT_TYPES.concat('', undefined).forEach(input => {
      expect(() => CreditCard.verify({
        ...CREDIT_CARD,
        cvc: input
      })).toThrowError(new TypeError('Invalid cvc'))
    })

    expect(() => CreditCard.verify({
      holderName: INVALID_INPUT_TYPES.concat(0, undefined)[Math.floor(Math.random() * INVALID_INPUT_TYPES.concat(0, undefined).length)],
      number: INVALID_INPUT_TYPES.concat(0, undefined)[Math.floor(Math.random() * INVALID_INPUT_TYPES.concat(0, undefined).length)],
      expiration: INVALID_INPUT_TYPES.concat(0, undefined)[Math.floor(Math.random() * INVALID_INPUT_TYPES.concat(0, undefined).length)],
      cvc: INVALID_INPUT_TYPES.concat('', undefined)[Math.floor(Math.random() * INVALID_INPUT_TYPES.concat('', undefined).length)]
    })).toThrow(AggregateError)
  })

  test('Given that one wants to verify a credit card with valid arguments', () => {
    VALID_CREDIT_CARD.forEach(creditCard => {
      expect(() => CreditCard.verify(creditCard)).not.toThrow()
    })

    expect(CreditCard.verify(CREDIT_CARD).toString()).toBeTruthy()
  })
})
