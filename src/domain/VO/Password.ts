// https://www.rfc-editor.org/rfc/rfc4013
// https://www.rfc-editor.org/rfc/rfc4616
// https://www.rfc-editor.org/rfc/rfc8264
// https://www.rfc-editor.org/rfc/rfc8265
// https://pages.nist.gov/800-63-3/sp800-63b.html

import crypto from 'node:crypto'

export type passwordDTO = {
  algorithm: string,
  iterations: number,
  salt: string,
  hash: string
}

export default class Password extends String {
  private static readonly pattern = new RegExp(`^\\$(?<algorithm>(${crypto.getHashes().join('|')}))\\$(?<iterations>\\d+)\\$(?<salt>[^.]+)\\.(?<hash>.+)$`, 'i')

  constructor (password: String, {
    algorithm,
    iterations,
    keyLength,
    minLength = 3,
    salt,
    strong = false
  }: {
    algorithm?: string,
    iterations?: number,
    keyLength?: number,
    minLength?: number,
    salt?: string,
    strong?: boolean
  } = {}) {
    if (!Password.verify(password, {
      minLength,
      strong
    })) {
      throw new TypeError('Invalid password')
    }

    super(Password.isHashed(password)
      ? password.trim()
      : Password.stringify(password, {
        algorithm,
        iterations,
        keyLength,
        salt
      }))

    Object.freeze(this)
  }

  private static stringify (password: String, {
    algorithm = 'sha512',
    iterations = 100000,
    keyLength = 64,
    salt = crypto.randomBytes(16).toString('base64url')
  }: {
    algorithm?: string,
    iterations?: number,
    keyLength?: number,
    salt?: string
  }) {
    const errors: TypeError[] = []

    if (
      typeof algorithm !== 'string' ||
      !crypto.getHashes().includes(algorithm)
    ) {
      errors.push(new TypeError('Invalid algorithm'))
    }
    if (
      !Number.isSafeInteger(iterations) ||
      iterations < 1
    ) {
      errors.push(new TypeError('Invalid iterations'))
    }
    if (
      !Number.isSafeInteger(keyLength) ||
      keyLength < 1
    ) {
      errors.push(new TypeError('Invalid keyLength'))
    }
    if (
      typeof salt !== 'string' ||
      salt.length === 0
    ) {
      errors.push(new TypeError('Invalid salt'))
    }

    if (errors.length > 1) {
      throw new AggregateError(errors, 'Invalid name')
    } else if (errors.length === 1) {
      throw errors.pop()
    }

    const hash = crypto.pbkdf2Sync(Buffer.from(password.normalize('NFC'), 'utf8'), salt, iterations, keyLength, algorithm).toString('base64url')

    // Modular Crypt Format
    return `$${algorithm}$${iterations}$${salt}.${hash}`
  }

  static isHashed (password: String) {
    return Password.pattern.test(password as string)
  }

  static isStrong (password: String) {
    return (
      /\d/.test(password as string) && // Has number
      /[a-z]/.test(password as string) && // Has lower case
      /[A-Z]/.test(password as string) && // Has upper case
      /[^a-z0-9]/i.test(password as string) // Has special character
    )
  }

  private static parse (password: String) {
    const parsed = password.match(Password.pattern)?.groups

    return {
      algorithm: parsed!.algorithm,
      iterations: parseInt(parsed!.iterations),
      salt: parsed!.salt,
      hash: parsed!.hash
    }
  }

  parse = () => {
    return Password.parse(this) as passwordDTO
  }

  static verify (password: String, {
    minLength = 3,
    strong = false
  }: {
    minLength?: number,
    strong?: boolean
  } = {}) {
    if (
      !(password instanceof String) &&
      typeof password !== 'string'
    ) {
      throw new TypeError('Invalid password')
    }

    if (
      !Number.isSafeInteger(minLength) ||
      minLength < 1
    ) {
      throw new TypeError('Invalid minLength')
    }

    return Password.isHashed(password) || (
      password.length >= minLength &&
      (!strong || Password.isStrong(password))
    )
  }

  equal = (password: string | Password) => {
    if (
      (
        !(password instanceof Password) &&
        typeof password !== 'string'
      ) ||
      (
        password instanceof Password &&
        !Password.isHashed(password)
      )
    ) {
      throw new TypeError('Invalid password')
    }

    const parsedPassword = this.parse()

    if (password instanceof Password) {
      return crypto.timingSafeEqual(Buffer.from(parsedPassword.hash, 'base64url'), Buffer.from(password.parse().hash, 'base64url'))
    }

    return crypto.timingSafeEqual(Buffer.from(parsedPassword.hash, 'base64url'), crypto.pbkdf2Sync(password, parsedPassword.salt, parsedPassword.iterations, Buffer.from(parsedPassword.hash, 'base64url').length, parsedPassword.algorithm))
  }
}
