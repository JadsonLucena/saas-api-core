import UUID from '../VO/UUID.js'
import Name from '../VO/Name.js'
import Email from '../VO/Email.js'
import Phone from '../VO/Phone.js'
import Password from '../VO/Password.js'

import Entity from './Entity.js'
import Oauth from './Oauth.js'
// import Email from './Email.js'
// import Phone from './Phone.js'

export type emailDTO = {
  id: UUID,
  createdAt: Date,
  confirmedAt?: Date,
  disabledAt?: Date
}

export type phoneDTO = {
  id: UUID,
  createdAt: Date,
  confirmedAt?: Date,
  disabledAt?: Date
}

export default class User extends Entity {
  #name: Name
  #phones: Map<string, emailDTO> = new Map<string, emailDTO>()
  #emails: Map<string, phoneDTO> = new Map<string, phoneDTO>()
  #username: Email
  #password: Password
  #picture?: URL
  #oauths: { [key: string]: Oauth } = {}
  #tfa: Boolean
  #updatedAt: Date
  #disabledAt?: Date

  constructor ({
    name,
    username,
    password,
    tfa = false,
    picture
  }: {
    name: Name,
    username: Email,
    password: Password,
    picture?: URL,
    tfa?: boolean
  }) {
    super()

    if (!(username instanceof Email)) {
      throw new TypeError('Invalid username')
    }

    this.name = name
    this.#username = username
    this.password = password
    this.picture = picture
    this.tfa = tfa
    this.#updatedAt = this.createdAt
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

  get phones (): phoneDTO[] {
    return Array.from(this.#phones.keys()).map(phone => Object.assign({ phone: new Phone(phone) }, this.#phones.get(phone)))
  }

  get emails (): emailDTO[] {
    return Array.from(this.#emails.keys()).map(email => Object.assign({ email: new Email(email) }, this.#emails.get(email)))
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

  get oauths () {
    return Object.values(this.#oauths)
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

  get updatedAt () {
    return this.#updatedAt
  }

  get disabledAt () {
    return this.#disabledAt
  }

  disable () {
    if (this.#disabledAt) {
      throw new Error('It\'s already disabled')
    }

    this.#updatedAt = this.#disabledAt = new Date()

    return this
  }

  enable () {
    if (!this.#disabledAt) {
      throw new Error('It\'s already enabled')
    }

    this.#disabledAt = undefined
    this.#updatedAt = new Date()

    return this
  }

  addEmail (email: Email) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(email instanceof Email)) {
      throw new TypeError('Invalid email')
    } else if (!email.parse().domain) {
      throw new Error('Domain required')
    }

    const key = email.toString().toLowerCase()

    if (this.#emails.get(key)) {
      throw new Error('It\'s already added')
    }

    this.#emails.set(key, {
      id: new UUID(),
      createdAt: new Date()
    })

    this.#updatedAt = new Date()

    return this
  }

  confirmEmail (email: Email) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(email instanceof Email)) {
      throw new TypeError('Invalid email')
    }

    const _email = this.#emails.get(email.toString().toLowerCase())

    if (!_email) {
      throw new Error('Not found')
    } else if (_email.confirmedAt) {
      throw new Error('It\'s already confirmed')
    }

    this.#updatedAt = _email.confirmedAt = new Date()

    return this
  }

  disableEmail (email: Email) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(email instanceof Email)) {
      throw new TypeError('Invalid email')
    }

    const _email = this.#emails.get(email.toString().toLowerCase())

    if (!_email) {
      throw new Error('Not found')
    } else if (_email.disabledAt) {
      throw new Error('It\'s already disabled')
    }

    this.#updatedAt = _email.disabledAt = new Date()

    return this
  }

  enableEmail (email: Email) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(email instanceof Email)) {
      throw new TypeError('Invalid email')
    }

    const _email = this.#emails.get(email.toString().toLowerCase())

    if (!_email) {
      throw new Error('Not found')
    } else if (!_email.disabledAt) {
      throw new Error('It\'s already enabled')
    }

    _email.disabledAt = undefined
    this.#updatedAt = new Date()

    return this
  }

  deleteEmail (email: Email) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(email instanceof Email)) {
      throw new TypeError('Invalid email')
    }

    const res = this.#emails.delete(email.toString().toLowerCase())
    this.#updatedAt = new Date()

    return res
  }

  addPhone (phone: Phone) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(phone instanceof Phone)) {
      throw new TypeError('Invalid phone')
    }

    const key = phone.toString().toLowerCase()

    if (this.#phones.get(key)) {
      throw new Error('It\'s already added')
    }

    this.#phones.set(key, {
      id: new UUID(),
      createdAt: new Date()
    })

    this.#updatedAt = new Date()

    return this
  }

  confirmPhone (phone: Phone) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(phone instanceof Phone)) {
      throw new TypeError('Invalid phone')
    }

    const _phone = this.#phones.get(phone.toString().toLowerCase())

    if (!_phone) {
      throw new Error('Not found')
    } else if (_phone.confirmedAt) {
      throw new Error('It\'s already confirmed')
    }

    this.#updatedAt = _phone.confirmedAt = new Date()

    return this
  }

  disablePhone (phone: Phone) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(phone instanceof Phone)) {
      throw new TypeError('Invalid phone')
    }

    const _phone = this.#phones.get(phone.toString().toLowerCase())

    if (!_phone) {
      throw new Error('Not found')
    } else if (_phone.disabledAt) {
      throw new Error('It\'s already disabled')
    }

    this.#updatedAt = _phone.disabledAt = new Date()

    return this
  }

  enablePhone (phone: Phone) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(phone instanceof Phone)) {
      throw new TypeError('Invalid phone')
    }

    const _phone = this.#phones.get(phone.toString().toLowerCase())

    if (!_phone) {
      throw new Error('Not found')
    } else if (!_phone.disabledAt) {
      throw new Error('It\'s already enabled')
    }

    _phone.disabledAt = undefined
    this.#updatedAt = new Date()

    return this
  }

  deletePhone (phone: Phone) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(phone instanceof Phone)) {
      throw new TypeError('Invalid phone')
    }

    const res = this.#phones.delete(phone.toString().toLowerCase())
    this.#updatedAt = new Date()

    return res
  }

  addOauth (oauth: Oauth) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(oauth instanceof Oauth)) {
      throw new TypeError('Invalid oauth')
    }

    const key = oauth.username.toString().toLowerCase()

    if (
      key in this.#oauths &&
      this.#oauths[key].provider.id.toString().toLowerCase() === oauth.provider.id.toString().toLowerCase()
    ) {
      throw new Error('It\'s already added')
    }

    this.#oauths[key] = oauth
    this.#updatedAt = new Date()

    return this
  }

  updateOauth (oauth: Oauth, {
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
    } else if (!(oauth instanceof Oauth)) {
      throw new TypeError('Invalid oauth')
    }

    const key = oauth.username.toString().toLowerCase()

    if (!(key in this.#oauths)) {
      throw new Error('Not found')
    }

    this.#oauths[key].name = name
    this.#oauths[key].picture = picture
    this.#oauths[key].accessToken = accessToken
    this.#oauths[key].refreshToken = refreshToken
    this.#oauths[key].expiresIn = expiresIn

    this.#updatedAt = new Date()

    return this
  }

  disableOauth (oauth: Oauth) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(oauth instanceof Oauth)) {
      throw new TypeError('Invalid oauth')
    }

    const key = oauth.username.toString().toLowerCase()

    if (!(key in this.#oauths)) {
      throw new Error('Not found')
    }

    this.#oauths[key].disable()
    this.#updatedAt = new Date()

    return this
  }

  enableOauth (oauth: Oauth) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(oauth instanceof Oauth)) {
      throw new TypeError('Invalid oauth')
    }

    const key = oauth.username.toString().toLowerCase()

    if (!(key in this.#oauths)) {
      throw new Error('Not found')
    }

    this.#oauths[key].enable()
    this.#updatedAt = new Date()

    return this
  }

  deleteOauth (oauth: Oauth) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(oauth instanceof Oauth)) {
      throw new TypeError('Invalid oauth')
    }

    const key = oauth.username.toString().toLowerCase()

    if (!(key in this.#oauths)) {
      return false
    }

    const res = delete this.#oauths[key]
    this.#updatedAt = new Date()

    return res
  }
}
