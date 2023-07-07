import UUID from '../VO/UUID.js'
import Name from '../VO/Name.js'
import EmailVO from '../VO/Email.js'
import Password from '../VO/Password.js'

import Entity from './Entity.js'
import Oauth from './Oauth.js'
import Email from './Email.js'
import Phone from './Phone.js'

export default class User extends Entity {
  #name: Name
  #phones: Phone[] = []
  #emails: Email[] = []
  #username: EmailVO
  #password: Password
  #picture?: URL
  #oauths: Oauth[] = []
  #tfa: Boolean
  #updatedAt: Date
  #disabledAt?: Date

  constructor ({
    id,
    name,
    // phones,
    // emails,
    username,
    password,
    // oauths,
    tfa = false,
    picture,
    createdAt,
    updatedAt,
    disabledAt
  }: {
    id?: UUID,
    name: Name,
    // phones?: Phone[],
    // emails?: Email[],
    username: EmailVO,
    password: Password,
    picture?: URL,
    // oauths?: Oauth[]
    tfa?: boolean,
    createdAt?: Date,
    updatedAt?: Date,
    disabledAt?: Date
  }) {
    super({
      id,
      createdAt
    })

    if (!(username instanceof EmailVO)) {
      throw new TypeError('Invalid username')
    }

    this.name = name
    // if (phones) this.phones.forEach(phone => this.addPhone(phone))
    // if (emails) this.emails.forEach(email => this.addEmail(email))
    this.#username = username
    this.password = password
    this.picture = picture
    // if (oauths) this.oauths.forEach(oauth => this.addOauth(oauth))
    this.tfa = tfa
    this.disabledAt = disabledAt
    this.updatedAt = updatedAt ?? this.createdAt
  }

  set name (name: Name) {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    } else if (!(name instanceof Name)) {
      throw new TypeError('Invalid name')
    }

    this.#name = name
    this.#updatedAt = new Date()
  }

  get name () {
    return this.#name
  }

  /* set phones (phones: Phone[]) {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    } else if (!Array.isArray(phones) || phones.some(phone => !(phone instanceof Phone))) {
      throw new TypeError('Invalid phones')
    }

    phones.forEach(newPhone => {
      if (!this.#phones.some(phone => phone.value.toString() === newPhone.value.toString())) {
        this.#phones.push(newPhone)
      }
    })

    this.#updatedAt = new Date()
  } */

  get phones () {
    return this.#phones
  }

  /* set emails (emails: Email[]) {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    } else if (!Array.isArray(emails) || emails.some(email => !(email instanceof Email))) {
      throw new TypeError('Invalid emails')
    } else if (emails.some(email => !email.value.parse().domain)) {
      throw new TypeError('Domain required')
    }

    emails.forEach(newEmail => {
      if (!this.#emails.some(email => email.value.localeCompare(newEmail.value.toString(), undefined, { sensitivity: 'accent' }) === 0)) {
        this.#emails.push(newEmail)
      }
    })

    this.#updatedAt = new Date()
  } */

  get emails () {
    return this.#emails
  }

  get username () {
    return this.#username
  }

  set password (password: Password) {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    } else if (!(password instanceof Password)) {
      throw new TypeError('Invalid password')
    }

    this.#password = password
    this.#updatedAt = new Date()
  }

  get password () {
    return this.#password
  }

  set picture (picture: URL | undefined) {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    } else if (!(picture instanceof URL) && typeof picture !== 'undefined') {
      throw new TypeError('Invalid picture')
    }

    this.#picture = picture
    this.#updatedAt = new Date()
  }

  get picture () {
    return this.#picture
  }

  /* set oauths (oauths: Oauth[]) {
    oauths.forEach(newOauth => {
      if (!this.#oauths.some(oauth => (
        oauth.username.localeCompare(newOauth.username.toString(), undefined, { sensitivity: 'accent' }) === 0
        && oauth.provider.name.localeCompare(newOauth.provider.name.toString(), undefined, { sensitivity: 'accent' }) === 0)
      )) {
        this.#oauths.push(newOauth)
      }
    })

    this.#updatedAt = new Date()
  } */

  get oauths () {
    return this.#oauths
  }

  set tfa (tfa: Boolean) {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    }

    this.#tfa = Boolean(tfa)
    this.#updatedAt = new Date()
  }

  get tfa () {
    return this.#tfa
  }

  set updatedAt (updatedAt: Date) {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    } else if (!(updatedAt instanceof Date)) {
      throw new TypeError('Invalid updatedAt')
    }

    this.#updatedAt = updatedAt
  }

  get updatedAt () {
    return this.#updatedAt
  }

  set disabledAt (disabledAt: Date | undefined) {
    if (!(disabledAt instanceof Date) && typeof disabledAt !== 'undefined') {
      throw new TypeError('Invalid disabledAt')
    } else if (this.#disabledAt && disabledAt) {
      throw new Error('It\'s already disabled')
    }

    this.#disabledAt = disabledAt
    this.#updatedAt = new Date()
  }

  get disabledAt () {
    return this.#disabledAt
  }

  addEmail (email: Email) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(email instanceof Email)) {
      throw new TypeError('Invalid email')
    }

    if (!this.#emails.some(e => e.value.localeCompare(email.value.toString(), undefined, { sensitivity: 'accent' }) === 0)) {
      this.#emails.push(email)
      this.#updatedAt = new Date()
    }

    return this
  }

  confirmEmail (id: UUID) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(id instanceof UUID)) {
      throw new TypeError('Invalid id')
    }

    const index = this.#emails.findIndex(email => email.id.localeCompare(id.toString(), undefined, { sensitivity: 'accent' }) === 0)

    if (index === -1) {
      throw new Error('Not found')
    }

    this.#emails[index].confirmedAt = new Date()
    this.#updatedAt = new Date()

    return this
  }

  disableEmail (id: UUID) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(id instanceof UUID)) {
      throw new TypeError('Invalid id')
    }

    const index = this.#emails.findIndex(email => email.id.localeCompare(id.toString(), undefined, { sensitivity: 'accent' }) === 0)

    if (index === -1) {
      throw new Error('Not found')
    }

    this.#emails[index].disabledAt = new Date()
    this.#updatedAt = new Date()

    return this
  }

  rehabilitateEmail (id: UUID) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(id instanceof UUID)) {
      throw new TypeError('Invalid id')
    }

    const index = this.#emails.findIndex(email => email.id.localeCompare(id.toString(), undefined, { sensitivity: 'accent' }) === 0)

    if (index === -1) {
      throw new Error('Not found')
    }

    this.#emails[index].disabledAt = undefined
    this.#updatedAt = new Date()

    return this
  }

  deleteEmail (id: UUID) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(id instanceof UUID)) {
      throw new TypeError('Invalid id')
    }

    const index = this.#emails.findIndex(email => email.id.localeCompare(id.toString(), undefined, { sensitivity: 'accent' }) === 0)

    if (index === -1) {
      return false
    }

    this.#emails.splice(index, 1)
    this.#updatedAt = new Date()

    return true
  }

  addPhone (phone: Phone) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(phone instanceof Phone)) {
      throw new TypeError('Invalid phone')
    }

    if (!this.#phones.some(p => p.value.toString() === phone.value.toString())) {
      this.#phones.push(phone)
      this.#updatedAt = new Date()
    }

    return this
  }

  confirmPhone (id: UUID) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(id instanceof UUID)) {
      throw new TypeError('Invalid id')
    }

    const index = this.#phones.findIndex(phone => phone.id.localeCompare(id.toString(), undefined, { sensitivity: 'accent' }) === 0)

    if (index === -1) {
      throw new Error('Not found')
    }

    this.#phones[index].confirmedAt = new Date()
    this.#updatedAt = new Date()

    return this
  }

  disablePhone (id: UUID) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(id instanceof UUID)) {
      throw new TypeError('Invalid id')
    }

    const index = this.#phones.findIndex(phone => phone.id.localeCompare(id.toString(), undefined, { sensitivity: 'accent' }) === 0)

    if (index === -1) {
      throw new Error('Not found')
    }

    this.#phones[index].disabledAt = new Date()
    this.#updatedAt = new Date()

    return this
  }

  rehabilitatePhone (id: UUID) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(id instanceof UUID)) {
      throw new TypeError('Invalid id')
    }

    const index = this.#phones.findIndex(phone => phone.id.localeCompare(id.toString(), undefined, { sensitivity: 'accent' }) === 0)

    if (index === -1) {
      throw new Error('Not found')
    }

    this.#phones[index].disabledAt = undefined
    this.#updatedAt = new Date()

    return this
  }

  deletePhone (id: UUID) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(id instanceof UUID)) {
      throw new TypeError('Invalid id')
    }

    const index = this.#phones.findIndex(phone => phone.id.localeCompare(id.toString(), undefined, { sensitivity: 'accent' }) === 0)

    if (index === -1) {
      return false
    }

    this.#phones.splice(index, 1)
    this.#updatedAt = new Date()

    return true
  }

  addOauth (oauth: Oauth) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(oauth instanceof Oauth)) {
      throw new TypeError('Invalid oauth')
    }

    if (!this.#oauths.some(o => (
      o.username.localeCompare(oauth.username.toString(), undefined, { sensitivity: 'accent' }) === 0 &&
      o.provider.id.localeCompare(oauth.provider.id.toString(), undefined, { sensitivity: 'accent' }) === 0
    ))) {
      this.#oauths.push(oauth)
      this.#updatedAt = new Date()
    }

    return this
  }

  updateOauth (id: Oauth, {
    name,
    picture,
    accessToken,
    refreshToken,
    expiresIn
  }: {
    name: Name,
    picture?: URL,
    accessToken: string,
    refreshToken: string,
    expiresIn: Date
  }) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(id instanceof UUID)) {
      throw new TypeError('Invalid id')
    }

    const index = this.#oauths.findIndex(oauth => oauth.id.localeCompare(id.toString(), undefined, { sensitivity: 'accent' }) === 0)

    if (index === -1) {
      throw new Error('Not found')
    }

    this.#oauths[index].name = name
    this.#oauths[index].picture = picture
    this.#oauths[index].accessToken = accessToken
    this.#oauths[index].refreshToken = refreshToken
    this.#oauths[index].expiresIn = expiresIn

    this.#updatedAt = new Date()

    return this
  }

  disableOauth (id: Oauth) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(id instanceof UUID)) {
      throw new TypeError('Invalid id')
    }

    const index = this.#oauths.findIndex(oauth => oauth.id.localeCompare(id.toString(), undefined, { sensitivity: 'accent' }) === 0)

    if (index === -1) {
      throw new Error('Not found')
    }

    this.#oauths[index].disabledAt = new Date()
    this.#updatedAt = new Date()

    return this
  }

  rehabilitateOauth (id: Oauth) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(id instanceof UUID)) {
      throw new TypeError('Invalid id')
    }

    const index = this.#oauths.findIndex(oauth => oauth.id.localeCompare(id.toString(), undefined, { sensitivity: 'accent' }) === 0)

    if (index === -1) {
      throw new Error('Not found')
    }

    this.#oauths[index].disabledAt = undefined
    this.#updatedAt = new Date()

    return this
  }

  deleteOauth (id: UUID) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(id instanceof UUID)) {
      throw new TypeError('Invalid id')
    }

    const index = this.#oauths.findIndex(oauth => oauth.id.localeCompare(id.toString(), undefined, { sensitivity: 'accent' }) === 0)

    if (index === -1) {
      return false
    }

    this.#oauths.splice(index, 1)
    this.#updatedAt = new Date()

    return true
  }
}
