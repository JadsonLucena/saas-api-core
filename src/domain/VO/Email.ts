// https://www.rfc-editor.org/rfc/rfc822
// https://www.rfc-editor.org/rfc/rfc2821
// https://www.rfc-editor.org/rfc/rfc5321
// https://www.rfc-editor.org/rfc/rfc5322

import dns from 'node:dns'

export type emailDTO = {
  username: string,
  domain?: string
}

export default class Email extends String {
  protected static readonly pattern = /^\s*(?<username>[a-z\d](?:\.?[+a-z\d_-]){0,63})(?:@(?<domain>(?:[^.@](?:\.?[^.@]){0,62}\.)?[a-z\d](?:-?[a-z\d]){0,62}(?:\.[a-z]{2,63}){1,2}))?\s*$/i

  constructor (email: String, domainRequired = true) {
    if (!Email.verify(email, domainRequired)) {
      throw new TypeError('Invalid email')
    }

    super(Email.stringify(email))

    Object.freeze(this)
  }

  private static stringify (email: String) {
    return email.normalize('NFC').trim()
  }

  private static parse (email: String) {
    return email.match(Email.pattern)?.groups
  }

  parse = () => {
    return Email.parse(this) as emailDTO
  }

  static verify (email: String, domainRequired: boolean = true) {
    if (
      !(email instanceof String) &&
      typeof email !== 'string'
    ) {
      throw new TypeError('Invalid email')
    }

    if (!Email.pattern.test(email as string)) {
      return false
    }

    const parsedEmail = Email.parse(email)

    return (
      email.trim().length <= 254 &&
      (!!parsedEmail && (!domainRequired || parsedEmail.domain))
    )
  }

  getMxRecords (): Promise<dns.MxRecord[]> {
    const { domain } = this.parse()

    if (!domain) {
      throw new Error('Domain required')
    }

    return dns.promises.resolveMx(domain)
  }
}
