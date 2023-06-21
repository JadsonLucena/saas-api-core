import Email from '../../../build/domain/VO/Email.js'

const VALID_USERNAMES = [
  'a',
  'A',
  '1',
  'john_',
  'john-',
  'john+',
  'john9',
  'jOhN',
  'John.Doe',
  'john--.__+--doe',
  'j.o-h_n+d--o___e++++',
  'x'.repeat(64),
  '0'.repeat(64)
]
const VALID_DOMAINS = [
  'a.co',
  '1.com',
  'domain.com',
  'DOMAIN.IO',
  '0domain.com.br',
  'd-omain.org.es',
  'e-x-a-m-p-l-e.cc.br',
  '0.domain.co.au',
  '_Test1_.domain.com',
  'fo0.bar.domain.me.uk',
  '#.%$7!A*&.Domain.us.com',
  `${'z'.repeat(63)}.com`,
  `${'9'.repeat(63)}.com`
]
const VALID_EMAILS = VALID_USERNAMES.map(username => VALID_DOMAINS.map(domain => `${username}@${domain}`)).flat()
const INVALID_USERNAMES = [
  '',
  '.john',
  'john.',
  '_john',
  '-john',
  '+john',
  'john..doe',
  'john.',
  'a'.repeat(65)
]
const INVALID_DOMAINS = [
  '',
  'a',
  '1',
  'domain.a',
  'domain.io.a',
  '.domain.io',
  'domain..io',
  'domain-.com',
  '-domain.com',
  'd--omain.com',
  '.subdomain.domain.org.uk',
  's..ubdomain.domain.nom.es',
  'subdomain..domain.org.uk',
  `${'b'.repeat(64)}.com`
]
const INVALID_EMAILS = INVALID_USERNAMES.map(username => INVALID_DOMAINS.map(domain => `${username}@${domain}`)).flat()
const INVALID_INPUT_TYPES = [
  0,
  Infinity,
  NaN,
  [],
  {},
  null,
  false,
  undefined
]

describe('Constructor', () => {
  test('Given that one wants to instantiate the object with invalid arguments', () => {
    INVALID_EMAILS.forEach(email => {
      expect(() => new Email(email)).toThrowError(new TypeError('Invalid email'))
    })
    INVALID_USERNAMES.forEach(username => {
      expect(() => new Email(username, false)).toThrowError(new TypeError('Invalid email'))
    })
    INVALID_INPUT_TYPES.forEach(email => {
      expect(() => new Email(email)).toThrowError(new TypeError('Invalid email'))
    })

    expect(() => new Email(VALID_USERNAMES[Math.floor(Math.random() * VALID_USERNAMES.length)])).toThrowError(new TypeError('Invalid email'))
  })

  test('Given that one wants to instantiate the object with valid arguments', () => {
    VALID_EMAILS.forEach(email => {
      expect(new Email(email).toString()).toBe(email)
    })
    VALID_USERNAMES.forEach(username => {
      expect(new Email(username, false).toString()).toBe(username)
    })

    const email = new Email(VALID_EMAILS[0])
    expect(new Email(email).toString()).toBe(email.toString())
    expect(new Email(email).parse()).toMatchObject(email.parse())
  })
})

describe('Methods', () => {
  test('Given that one wants to parse a email', () => {
    const email = VALID_EMAILS[Math.floor(Math.random() * VALID_EMAILS.length)]
    const parsedEmail = new Email(email).parse()

    expect(parsedEmail).toBeDefined()
    expect(parsedEmail?.username).toBe(email.split('@')[0])
    expect(parsedEmail?.domain).toBe(email.split('@')[1])
  })

  test('Given that one wants to verify a email with invalid arguments', () => {
    INVALID_EMAILS.forEach(email => {
      expect(Email.verify(email)).toBeFalsy()
    })
    INVALID_USERNAMES.forEach(username => {
      expect(Email.verify(username, false)).toBeFalsy()
    })
    INVALID_INPUT_TYPES.forEach(email => {
      expect(() => Email.verify(email)).toThrowError(new TypeError('Invalid email'))
    })

    expect(Email.verify(VALID_USERNAMES[Math.floor(Math.random() * VALID_USERNAMES.length)])).toBeFalsy()
  })

  test('Given that one wants to verify a email with valid arguments', () => {
    VALID_EMAILS.forEach(email => {
      expect(Email.verify(email)).toBeTruthy()
    })
    VALID_USERNAMES.forEach(username => {
      expect(Email.verify(username, false)).toBeTruthy()
    })
  })

  test('Given that one wants to check if the domain is from a valid email server', () => {
    expect(new Email('john.doe@example.io').getMxRecords()).rejects.toThrowError(new Error('queryMx ENODATA example.io'))
    expect(() => {
      new Email('john.doe', false).getMxRecords()
    }).toThrowError(new Error('Domain required'))

    expect(new Email('john.doe@gmail.com').getMxRecords()).resolves.toEqual(expect.arrayContaining([
      expect.objectContaining({
        exchange: expect.any(String),
        priority: expect.any(Number)
      })
    ]))
  })
})
