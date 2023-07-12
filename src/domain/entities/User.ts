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
    name,
    username,
    password,
    tfa = false,
    picture
  }: {
    name: Name,
    username: EmailVO,
    password: Password,
    picture?: URL,
    tfa?: boolean
  }) {
    super()

    if (!(username instanceof EmailVO)) {
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

  get phones () {
    return this.#phones
  }

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
  }

  enable () {
    if (!this.#disabledAt) {
      throw new Error('It\'s already enabled')
    }

    this.#disabledAt = undefined
    this.#updatedAt = new Date()
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

  enableEmail (id: UUID) {
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

  enablePhone (id: UUID) {
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

    this.#oauths[index].disable()
    this.#updatedAt = new Date()

    return this
  }

  enableOauth (id: Oauth) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(id instanceof UUID)) {
      throw new TypeError('Invalid id')
    }

    const index = this.#oauths.findIndex(oauth => oauth.id.localeCompare(id.toString(), undefined, { sensitivity: 'accent' }) === 0)

    if (index === -1) {
      throw new Error('Not found')
    }

    this.#oauths[index].enable()
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
