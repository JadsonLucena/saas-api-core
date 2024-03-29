/* Business Rules
 - [x] If updatedAt is not set in entity creation, then it will be the same as createdAt
 - [x] Whenever you update something in the entity, the updatedAt attribute must be updated
 - [x] If entity is disabled, no attributes can be updated
 - [x] The email must have a domain
 - [x] It will only be possible to disable or remove an email if it has at least one other email confirmed and enabled
 - [ ] The user can have MFA (MultiFactor Authentication)
 - [x] You can only enable MFA for a phone if it is confirmed and enabled
 - [x] It will only be possible to disable or remove a phone if it has not linked to MFA
 - [ ] check if the mediatype is of an image in picture
*/
import { isUndefined, isDate, isURL } from '../service/TypeGuard.js'

import UUID from '../VO/UUID.js'
import Name from '../VO/Name.js'
import Email from '../VO/Email.js'
import Phone from '../VO/Phone.js'
import Password from '../VO/Password.js'

import Entity from './AbstractEntity.js'
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
  #tfa?: Phone
  #emails: { [key: string]: Omit<EmailDTO, 'email'> } = {}
  #phones: { [key: string]: Omit<PhoneDTO, 'phone'> } = {}
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
    if (!isDate(disabledAt) && !isUndefined(disabledAt)) {
      throw new TypeError('Invalid disabledAt')
    }
    if (!isDate(updatedAt) && !isUndefined(updatedAt)) {
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
    return Object.keys(this.#phones).map(phone => Object.assign({ phone: new Phone(phone) }, this.#phones[phone]))
  }

  get emails (): EmailDTO[] {
    return Object.keys(this.#emails).map(email => Object.assign({ email: new Email(email) }, this.#emails[email]))
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
    } else if (!isURL(picture) && !isUndefined(picture)) {
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

  set tfa (phone: Phone | undefined) {
    if (this.#disabledAt) {
      throw new Error('It\'s disabled')
    } else if (!(phone instanceof Phone) && !isUndefined(phone)) {
      throw new TypeError('Invalid phone')
    }

    if (phone) {
      const _phone = this.#phones[phone.toString()]

      if (
        !_phone ||
        !_phone.confirmedAt ||
        _phone.disabledAt
      ) {
        throw new Error('The phone must be confirmed and enabled')
      }
    }

    this.#tfa = phone
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
    } else if (!isDate(createdAt) && !isUndefined(createdAt)) {
      throw new TypeError('Invalid createdAt')
    } else if (!isDate(confirmedAt) && !isUndefined(confirmedAt)) {
      throw new TypeError('Invalid confirmedAt')
    } else if (!isDate(disabledAt) && !isUndefined(disabledAt)) {
      throw new TypeError('Invalid disabledAt')
    }

    const key = email.toString().toLowerCase()

    if (key in this.#emails) {
      throw new Error('It\'s already added')
    }

    this.#emails[key] = {
      createdAt,
      confirmedAt,
      disabledAt
    }

    this.#updatedAt = new Date()

    return this
  }

  confirmEmail (email: Email) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(email instanceof Email)) {
      throw new TypeError('Invalid email')
    }

    const key = email.toString().toLowerCase()

    if (!(key in this.#emails)) {
      throw new Error('Not found')
    } else if (this.#emails[key].confirmedAt) {
      throw new Error('It\'s already confirmed')
    }

    this.#updatedAt = this.#emails[key].confirmedAt = new Date()

    return this
  }

  disableEmail (email: Email) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(email instanceof Email)) {
      throw new TypeError('Invalid email')
    }

    const key = email.toString().toLowerCase()

    if (!(key in this.#emails)) {
      throw new Error('Not found')
    } else if (this.#emails[key].disabledAt) {
      throw new Error('It\'s already disabled')
    } else if (!Object.keys(this.#emails).some(email => (
      email !== key &&
      this.#emails[email]?.confirmedAt &&
      !this.#emails[email]?.disabledAt
    ))) {
      throw new Error('The User must have at least one active email')
    }

    this.#updatedAt = this.#emails[key].disabledAt = new Date()

    return this
  }

  enableEmail (email: Email) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(email instanceof Email)) {
      throw new TypeError('Invalid email')
    }

    const key = email.toString().toLowerCase()

    if (!(key in this.#emails)) {
      throw new Error('Not found')
    } else if (!this.#emails[key].disabledAt) {
      throw new Error('It\'s already enabled')
    }

    this.#emails[key].disabledAt = undefined
    this.#updatedAt = new Date()

    return this
  }

  deleteEmail (email: Email) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(email instanceof Email)) {
      throw new TypeError('Invalid email')
    }

    const key = email.toString().toLowerCase()

    if (!(key in this.#emails)) {
      return false
    } else if (!Object.keys(this.#emails).some(email => (
      email !== key &&
      this.#emails[email]?.confirmedAt &&
      !this.#emails[email]?.disabledAt
    ))) {
      throw new Error('The User must have at least one active email')
    }

    const res = delete this.#emails[key]
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
    } else if (!isDate(createdAt) && !isUndefined(createdAt)) {
      throw new TypeError('Invalid createdAt')
    } else if (!isDate(confirmedAt) && !isUndefined(confirmedAt)) {
      throw new TypeError('Invalid confirmedAt')
    } else if (!isDate(disabledAt) && !isUndefined(disabledAt)) {
      throw new TypeError('Invalid disabledAt')
    }

    const key = phone.toString()

    if (key in this.#phones) {
      throw new Error('It\'s already added')
    }

    this.#phones[key] = {
      createdAt,
      confirmedAt,
      disabledAt
    }

    this.#updatedAt = new Date()

    return this
  }

  confirmPhone (phone: Phone) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(phone instanceof Phone)) {
      throw new TypeError('Invalid phone')
    }

    const key = phone.toString()

    if (!(key in this.#phones)) {
      throw new Error('Not found')
    } else if (this.#phones[key].confirmedAt) {
      throw new Error('It\'s already confirmed')
    }

    this.#updatedAt = this.#phones[key].confirmedAt = new Date()

    return this
  }

  disablePhone (phone: Phone) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(phone instanceof Phone)) {
      throw new TypeError('Invalid phone')
    }

    const key = phone.toString()

    if (!(key in this.#phones)) {
      throw new Error('Not found')
    } else if (this.#phones[key].disabledAt) {
      throw new Error('It\'s already disabled')
    } else if (this.#tfa && this.#tfa.toString() === key) {
      throw new Error('Two-Factor Authentication is enabled')
    }

    this.#updatedAt = this.#phones[key].disabledAt = new Date()

    return this
  }

  enablePhone (phone: Phone) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(phone instanceof Phone)) {
      throw new TypeError('Invalid phone')
    }

    const key = phone.toString()

    if (!(key in this.#phones)) {
      throw new Error('Not found')
    } else if (!this.#phones[key].disabledAt) {
      throw new Error('It\'s already enabled')
    }

    this.#phones[key].disabledAt = undefined
    this.#updatedAt = new Date()

    return this
  }

  deletePhone (phone: Phone) {
    if (this.#disabledAt) {
      throw new Error('User is disabled')
    } else if (!(phone instanceof Phone)) {
      throw new TypeError('Invalid phone')
    }

    const key = phone.toString()

    if (!(key in this.#phones)) {
      return false
    } else if (this.#tfa && this.#tfa.toString() === key) {
      throw new Error('Two-Factor Authentication is enabled')
    }

    const res = delete this.#phones[key]
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
    expiresIn,
    refreshToken,
    refreshTokenExpiresIn
  }: {
    name: Name,
    picture?: URL,
    accessToken: string,
    expiresIn: Date
    refreshToken: string,
    refreshTokenExpiresIn?: Date
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
    this.#oauths[key].expiresIn = expiresIn
    this.#oauths[key].refreshToken = refreshToken
    this.#oauths[key].refreshTokenExpiresIn = refreshTokenExpiresIn

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
