/* Business Rules
 - [x] If updatedAt is not set in entity creation, then it will be the same as createdAt
 - [x] Whenever you update something in the entity, the updatedAt attribute must be updated
 - [x] If entity is disabled, no attributes can be updated
 - [x] The email must have a domain
 - [x] It will only be possible to disable or remove an email if it has at least one other email confirmed and enabled
 - [ ] The user can have MFA (MultiFactor Authentication)
 - [ ] You can only enable MFA for a phone if it is confirmed and enabled
 - [ ] It will only be possible to disable or remove a phone if it has not linked to MFA
*/

import UUID from '../VO/UUID.js'
import Name from '../VO/Name.js'
import Email from '../VO/Email.js'
import Phone from '../VO/Phone.js'
import Password from '../VO/Password.js'

import Entity from './Entity.js'
import Oauth from './Oauth.js'

export type EmailDTO = {
  email: Email,
  createdAt?: Date,
  confirmedAt?: Date,
  disabledAt?: Date
}

export type PhoneDTO = {
  phone: Phone,
  createdAt?: Date,
  confirmedAt?: Date,
  disabledAt?: Date
}

export default class User extends Entity {
  #name: Name
  #username: Email
  #password: Password
  #picture?: URL
  #tfa: Boolean = false
  #emails: Map<string, Omit<EmailDTO, 'email'>> = new Map<string, Omit<EmailDTO, 'email'>>()
  #phones: Map<string, Omit<PhoneDTO, 'phone'>> = new Map<string, Omit<PhoneDTO, 'phone'>>()
  #oauths: { [key: string]: Oauth } = {}
  #updatedAt: Date
  #disabledAt?: Date

  constructor ({
    id,
    name,
    username,
    password,
    picture,
    createdAt,
    updatedAt,
    disabledAt
  }: {
    id?: UUID,
    name: Name,
    username: Email,
    password: Password,
    picture?: URL,
    createdAt?: Date,
    updatedAt?: Date,
    disabledAt?: Date
  }) {
    super({
      id,
      createdAt
    })

    if (!(username instanceof Email)) {
      throw new TypeError('Invalid username')
    }
    if (!(disabledAt instanceof Date) && typeof disabledAt !== 'undefined') {
      throw new TypeError('Invalid disabledAt')
    }
    if (!(updatedAt instanceof Date) && typeof updatedAt !== 'undefined') {
      throw new TypeError('Invalid updatedAt')
    }

    this.name = name
    this.#username = username
    this.password = password
    this.picture = picture
    this.#disabledAt = disabledAt
    this.#updatedAt = updatedAt ?? this.createdAt
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

  get phones (): PhoneDTO[] {
    return Array.from(this.#phones.keys()).map(phone => Object.assign({ phone: new Phone(phone) }, this.#phones.get(phone)))
  }

  get emails (): EmailDTO[] {
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
    } else if (tfa && !Array.from(this.#phones.values()).some(phone => phone.confirmedAt && !phone.disabledAt)) {
      throw new Error('The User must have at least one active phone')
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

  addEmail (email: Email, {
    createdAt = new Date(),
    confirmedAt,
    disabledAt
  }: Omit<EmailDTO, 'email'> = {}) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(email instanceof Email)) {
      throw new TypeError('Invalid email')
    } else if (!email.parse().domain) {
      throw new Error('Domain required')
    } else if (!(createdAt instanceof Date) && typeof createdAt !== 'undefined') {
      throw new TypeError('Invalid createdAt')
    } else if (!(confirmedAt instanceof Date) && typeof confirmedAt !== 'undefined') {
      throw new TypeError('Invalid confirmedAt')
    } else if (!(disabledAt instanceof Date) && typeof disabledAt !== 'undefined') {
      throw new TypeError('Invalid disabledAt')
    }

    const key = email.toString().toLowerCase()

    if (this.#emails.get(key)) {
      throw new Error('It\'s already added')
    }

    this.#emails.set(key, {
      createdAt,
      confirmedAt,
      disabledAt
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
    } else if (Array.from(this.#emails.keys()).filter(key => (
      key !== email.toString().toLowerCase() &&
      this.#emails.get(key)?.confirmedAt &&
      !this.#emails.get(key)?.disabledAt
    )).length < 1) {
      throw new Error('The User must have at least one active email')
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
    } else if (
      this.#emails.get(email.toString().toLowerCase()) &&
      Array.from(this.#emails.keys()).filter(key => (
        key !== email.toString().toLowerCase() &&
        this.#emails.get(key)?.confirmedAt &&
        !this.#emails.get(key)?.disabledAt
      )).length < 1
    ) {
      throw new Error('The User must have at least one active email')
    }

    const res = this.#emails.delete(email.toString().toLowerCase())
    this.#updatedAt = new Date()

    return res
  }

  addPhone (phone: Phone, {
    createdAt = new Date(),
    confirmedAt,
    disabledAt
  }: Omit<PhoneDTO, 'phone'> = {}) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(phone instanceof Phone)) {
      throw new TypeError('Invalid phone')
    } else if (!(createdAt instanceof Date) && typeof createdAt !== 'undefined') {
      throw new TypeError('Invalid createdAt')
    } else if (!(confirmedAt instanceof Date) && typeof confirmedAt !== 'undefined') {
      throw new TypeError('Invalid confirmedAt')
    } else if (!(disabledAt instanceof Date) && typeof disabledAt !== 'undefined') {
      throw new TypeError('Invalid disabledAt')
    }

    const key = phone.toString().toLowerCase()

    if (this.#phones.get(key)) {
      throw new Error('It\'s already added')
    }

    this.#phones.set(key, {
      createdAt,
      confirmedAt,
      disabledAt
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
    } else if (this.#tfa && Array.from(this.#phones.keys()).filter(key => (
      key !== phone.toString().toLowerCase() &&
      this.#phones.get(key)?.confirmedAt &&
      !this.#phones.get(key)?.disabledAt
    )).length < 1) {
      throw new Error('TFA active. The User must have at least one active phone')
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
    } else if (
      this.#phones.get(phone.toString().toLowerCase()) &&
      this.#tfa &&
      Array.from(this.#phones.keys()).filter(key => (
        key !== phone.toString().toLowerCase() &&
        this.#phones.get(key)?.confirmedAt &&
        !this.#phones.get(key)?.disabledAt
      )).length < 1
    ) {
      throw new Error('TFA active. The User must have at least one active phone')
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
