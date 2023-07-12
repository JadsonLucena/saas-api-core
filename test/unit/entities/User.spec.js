import UUID from '../../../build/domain/VO/UUID.js'
import Name from '../../../build/domain/VO/Name.js'
import EmailVO from '../../../build/domain/VO/Email.js'
import PhoneVO from '../../../build/domain/VO/Phone.js'
import Password from '../../../build/domain/VO/Password.js'

import User from '../../../build/domain/entities/User.js'
import Email from '../../../build/domain/entities/Email.js'
import Phone from '../../../build/domain/entities/Phone.js'
import OauthProvider from '../../../build/domain/entities/OauthProvider.js'
import Oauth from '../../../build/domain/entities/Oauth.js'

const ONE_YEAR = 31622400000

const MIN_USER = {
  name: new Name('John Doe'),
  username: new EmailVO('john.doe', false),
  password: new Password('pJHx60N+je6-KAOK)b')
}
const MAX_USER = {
  ...MIN_USER,
  picture: new URL('file://path/to/file.webp'),
  tfa: true
}
const INVALID_INPUT_TYPES = [
  {},
  [],
  '',
  0,
  Infinity,
  NaN,
  false
]

describe('Constructor', () => {
  test('Given that one wants to instantiate the object with an invalid argument', () => {
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new User(input)).toThrowError()
    })

    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new User({
        ...MAX_USER,
        name: input
      })).toThrowError(new TypeError('Invalid name'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new User({
        ...MAX_USER,
        username: input
      })).toThrowError(new TypeError('Invalid username'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new User({
        ...MAX_USER,
        password: input
      })).toThrowError(new TypeError('Invalid password'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new User({
        ...MAX_USER,
        picture: input
      })).toThrowError(new TypeError('Invalid picture'))
    })
  })

  test('Given that one wants to instantiate the object with a valid argument', () => {
    expect(() => new User(MIN_USER)).not.toThrow()
    expect(() => new User(MAX_USER)).not.toThrow()

    const user = new User(MAX_USER)
    expect(user.username).toBe(MAX_USER.username)
    expect(user.createdAt).toEqual(user.updatedAt)
  })
})

describe('Attributes', () => {
  test('Given that we want to try to update readonly attributes', () => {
    const user = new User(MIN_USER)

    expect(() => {
      user.username = MAX_USER.username
    }).toThrow()
  })
  test('Given that we want to check for entity update whenever an attribute is updated', () => {
    const user = new User(MIN_USER)

    let updatedAt = user.updatedAt
    user.name = MAX_USER.name
    expect(user.name).toBe(MAX_USER.name)
    expect(user.updatedAt).not.toBe(updatedAt)

    updatedAt = user.updatedAt
    user.password = MAX_USER.password
    expect(user.password).toBe(MAX_USER.password)
    expect(user.updatedAt).not.toBe(updatedAt)

    updatedAt = user.updatedAt
    user.tfa = MAX_USER.tfa
    expect(user.tfa).toBe(MAX_USER.tfa)
    expect(user.updatedAt).not.toBe(updatedAt)

    updatedAt = user.updatedAt
    user.picture = MAX_USER.picture
    expect(user.picture).toBe(MAX_USER.picture)
    expect(user.updatedAt).not.toBe(updatedAt)

    updatedAt = user.updatedAt
    user.disable()
    expect(user.disabledAt).toBe(user.updatedAt)
    expect(user.updatedAt).not.toBe(updatedAt)

    updatedAt = user.updatedAt
    user.enable()
    expect(user.disabledAt).toBeUndefined()
    expect(user.updatedAt).not.toBe(updatedAt)
  })
  test('Given that we want to disable the entity', () => {
    const user = new User(MIN_USER)

    user.disable()

    expect(() => {
      user.name = MAX_USER.name
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      user.password = MAX_USER.password
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      user.tfa = MAX_USER.tfa
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      user.picture = MAX_USER.picture
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      user.disable()
    }).toThrowError(new Error('It\'s already disabled'))

    expect(() => {
      user.enable()
    }).not.toThrow()
    expect(() => {
      user.enable()
    }).toThrowError(new Error('It\'s already enabled'))

    expect(user.disabledAt).toBeUndefined()
  })
})

describe('Methods', () => {
  test('Given that we want to add emails', () => {
    const user = new User(MIN_USER)

    const email = new Email({
      value: new EmailVO('john.doe@example.com')
    })
    const emailUpperCase = new Email({
      value: new EmailVO('JOHN.DOE@example.com')
    })

    user
      .addEmail(email)
      .addEmail(emailUpperCase)

    expect(user.emails.length).toBe(1)
    expect(user.emails).toContain(email)
    expect(user.emails).not.toContain(emailUpperCase)

    const otherEmail = new Email({
      value: new EmailVO('username@example.com')
    })

    user.addEmail(otherEmail)

    expect(user.emails.length).toBe(2)
    expect(user.emails).toContain(otherEmail)

    expect(() => user.addEmail(new EmailVO('login@example.com'))).toThrowError(new TypeError('Invalid email'))
    expect(() => user.addEmail(new Email({
      value: new EmailVO('login', false)
    }))).toThrowError(new TypeError('Domain required'))

    user.disable()

    expect(() => user.addEmail(otherEmail)).toThrowError(new Error('User is disabled'))
  })
  test('Given that we want to confirm emails', () => {
    const user = new User(MIN_USER)

    const email = new Email({
      value: new EmailVO('john.doe@example.com')
    })

    user
      .addEmail(email)
      .confirmEmail(email.id)

    expect(user.emails[0].confirmedAt).toBeDefined()

    expect(() => user.confirmEmail('id')).toThrowError(new TypeError('Invalid id'))
    expect(() => user.confirmEmail(new UUID())).toThrowError(new Error('Not found'))

    user.disable()

    expect(() => user.confirmEmail(email.id)).toThrowError(new Error('User is disabled'))
  })
  test('Given that we want to disable emails', () => {
    const user = new User(MIN_USER)

    const email = new Email({
      value: new EmailVO('john.doe@example.com')
    })

    user
      .addEmail(email)
      .disableEmail(email.id)

    expect(user.emails[0].disabledAt).toBeDefined()

    expect(() => user.disableEmail('id')).toThrowError(new TypeError('Invalid id'))
    expect(() => user.disableEmail(new UUID())).toThrowError(new Error('Not found'))

    user.disable()

    expect(() => user.disableEmail(email.id)).toThrowError(new Error('User is disabled'))
  })
  test('Given that we want to enable emails', () => {
    const user = new User(MIN_USER)

    const email = new Email({
      value: new EmailVO('john.doe@example.com')
    })

    user
      .addEmail(email)
      .disableEmail(email.id)
      .enableEmail(email.id)

    expect(user.emails[0].disabledAt).toBeUndefined()

    expect(() => user.enableEmail('id')).toThrowError(new TypeError('Invalid id'))
    expect(() => user.enableEmail(new UUID())).toThrowError(new Error('Not found'))

    user.disable()

    expect(() => user.enableEmail(email.id)).toThrowError(new Error('User is disabled'))
  })
  test('Given that we want to delete emails', () => {
    const user = new User(MIN_USER)

    const email = new Email({
      value: new EmailVO('john.doe@example.com')
    })

    user.addEmail(email)

    expect(user.deleteEmail(new UUID())).toBeFalsy()
    expect(user.deleteEmail(email.id)).toBeTruthy()
    expect(user.emails.length).toBe(0)

    expect(() => user.deleteEmail('id')).toThrowError(new TypeError('Invalid id'))

    user.disable()

    expect(() => user.deleteEmail(email.id)).toThrowError(new Error('User is disabled'))
  })

  test('Given that we want to add phones', () => {
    const user = new User(MIN_USER)

    const phone = new Phone({
      value: new PhoneVO('+0 (1) 234-5678')
    })

    user
      .addPhone(phone)
      .addPhone(phone)

    expect(user.phones.length).toBe(1)
    expect(user.phones).toContain(phone)

    const otherPhone = new Phone({
      value: new PhoneVO('+01-234 (123) 67890-1234')
    })

    user.addPhone(otherPhone)

    expect(user.phones.length).toBe(2)
    expect(user.phones).toContain(otherPhone)

    expect(() => user.addPhone(new PhoneVO('+01-234 (123) 67890-1234'))).toThrowError(new TypeError('Invalid phone'))

    user.disable()

    expect(() => user.addPhone(otherPhone)).toThrowError(new Error('User is disabled'))
  })
  test('Given that we want to confirm phones', () => {
    const user = new User(MIN_USER)

    const phone = new Phone({
      value: new PhoneVO('+0 (1) 234-5678')
    })

    user
      .addPhone(phone)
      .confirmPhone(phone.id)

    expect(user.phones[0].confirmedAt).toBeDefined()

    expect(() => user.confirmPhone('id')).toThrowError(new TypeError('Invalid id'))
    expect(() => user.confirmPhone(new UUID())).toThrowError(new Error('Not found'))

    user.disable()

    expect(() => user.confirmPhone(phone.id)).toThrowError(new Error('User is disabled'))
  })
  test('Given that we want to disable phones', () => {
    const user = new User(MIN_USER)

    const phone = new Phone({
      value: new PhoneVO('+0 (1) 234-5678')
    })

    user
      .addPhone(phone)
      .disablePhone(phone.id)

    expect(user.phones[0].disabledAt).toBeDefined()

    expect(() => user.disablePhone('id')).toThrowError(new TypeError('Invalid id'))
    expect(() => user.disablePhone(new UUID())).toThrowError(new Error('Not found'))

    user.disable()

    expect(() => user.disablePhone(phone.id)).toThrowError(new Error('User is disabled'))
  })
  test('Given that we want to enable phones', () => {
    const user = new User(MIN_USER)

    const phone = new Phone({
      value: new PhoneVO('+0 (1) 234-5678')
    })

    user
      .addPhone(phone)
      .disablePhone(phone.id)
      .enablePhone(phone.id)

    expect(user.phones[0].disabledAt).toBeUndefined()

    expect(() => user.enablePhone('id')).toThrowError(new TypeError('Invalid id'))
    expect(() => user.enablePhone(new UUID())).toThrowError(new Error('Not found'))

    user.disable()

    expect(() => user.enablePhone(phone.id)).toThrowError(new Error('User is disabled'))
  })
  test('Given that we want to delete phones', () => {
    const user = new User(MIN_USER)

    const phone = new Phone({
      value: new PhoneVO('+0 (1) 234-5678')
    })

    user.addPhone(phone)

    expect(user.deletePhone(new UUID())).toBeFalsy()
    expect(user.deletePhone(phone.id)).toBeTruthy()
    expect(user.phones.length).toBe(0)

    expect(() => user.deletePhone('id')).toThrowError(new TypeError('Invalid id'))

    user.disable()

    expect(() => user.deletePhone(phone.id)).toThrowError(new Error('User is disabled'))
  })

  test('Given that we want to add oauths', () => {
    const user = new User(MIN_USER)

    const oauthProvider = new OauthProvider({
      name: new Name('Github', {
        minAmountOfLastNames: 0
      }),
      clientId: '115c7faa93f26f0c4fff',
      clientSecret: 'c486cf3d8670a2fe84ded7d08abd97300845677e'
    })

    const oauth = new Oauth({
      provider: oauthProvider,
      name: new Name('John Doe', {
        minAmountOfLastNames: 0
      }),
      username: new EmailVO('john.doe@example.com', false),
      accessToken: 'gho_16C7e42F292c6912E7710c838347Ae178B4a',
      refreshToken: 'ghr_1882EdB3e71C470cbeAd9c6B5118c8bc',
      expiresIn: new Date(Date.now() + ONE_YEAR)
    })
    const oauthUpperCase = new Oauth({
      provider: oauthProvider,
      name: new Name('John Doe', {
        minAmountOfLastNames: 0
      }),
      username: new EmailVO('JOHN.DOE@example.com', false),
      accessToken: 'gho_16C7e42F292c6912E7710c838347Ae178B4a',
      refreshToken: 'ghr_1882EdB3e71C470cbeAd9c6B5118c8bc',
      expiresIn: new Date(Date.now() + ONE_YEAR)
    })

    user
      .addOauth(oauth)
      .addOauth(oauthUpperCase)

    expect(user.oauths.length).toBe(1)
    expect(user.oauths).toContain(oauth)

    const otherOauth = new Oauth({
      provider: oauthProvider,
      name: new Name('John', {
        minAmountOfLastNames: 0
      }),
      username: new EmailVO('john@example.com', false),
      accessToken: 'gho_16C7e42F292c6912E7710c838347Ae178B4a',
      refreshToken: 'ghr_1882EdB3e71C470cbeAd9c6B5118c8bc',
      expiresIn: new Date(Date.now() + ONE_YEAR)
    })

    user.addOauth(otherOauth)

    expect(user.oauths.length).toBe(2)
    expect(user.oauths).toContain(otherOauth)

    expect(() => user.addOauth(oauthProvider)).toThrowError(new TypeError('Invalid oauth'))

    user.disable()

    expect(() => user.addOauth(otherOauth)).toThrowError(new Error('User is disabled'))
  })
  test('Given that we want to update oauths', () => {
    const user = new User(MIN_USER)

    const oauthProvider = new OauthProvider({
      name: new Name('Github', {
        minAmountOfLastNames: 0
      }),
      clientId: '115c7faa93f26f0c4fff',
      clientSecret: 'c486cf3d8670a2fe84ded7d08abd97300845677e'
    })

    const oauth = new Oauth({
      provider: oauthProvider,
      name: new Name('John Doe', {
        minAmountOfLastNames: 0
      }),
      username: new EmailVO('john.doe@example.com', false),
      accessToken: 'gho_16C7e42F292c6912E7710c838347Ae178B4a',
      refreshToken: 'ghr_1882EdB3e71C470cbeAd9c6B5118c8bc',
      expiresIn: new Date(Date.now() + ONE_YEAR)
    })

    const data = {
      name: new Name('John', {
        minAmountOfLastNames: 0
      }),
      accessToken: 'gho_A8Fde42F291c6912E7710c838347Ae178B4a',
      refreshToken: 'ghr_27fa0581e0084597a85632afe4a103aa',
      expiresIn: new Date(Date.now() + ONE_YEAR)
    }

    user
      .addOauth(oauth)
      .updateOauth(oauth.id, data)

    expect(user.oauths.length).toBe(1)
    expect(user.oauths).toContain(oauth)
    expect(user.oauths[0].name).toBe(data.name)
    expect(user.oauths[0].accessToken).toBe(data.accessToken)
    expect(user.oauths[0].refreshToken).toBe(data.refreshToken)
    expect(user.oauths[0].expiresIn).toBe(data.expiresIn)

    expect(() => user.updateOauth('id', data)).toThrowError(new TypeError('Invalid id'))
    expect(() => user.updateOauth(new UUID(), data)).toThrowError(new Error('Not found'))

    user.disable()

    expect(() => user.updateOauth(oauth.id, data)).toThrowError(new Error('User is disabled'))
  })
  test('Given that we want to disable oauths', () => {
    const user = new User(MIN_USER)

    const oauthProvider = new OauthProvider({
      name: new Name('Github', {
        minAmountOfLastNames: 0
      }),
      clientId: '115c7faa93f26f0c4fff',
      clientSecret: 'c486cf3d8670a2fe84ded7d08abd97300845677e'
    })

    const oauth = new Oauth({
      provider: oauthProvider,
      name: new Name('John Doe', {
        minAmountOfLastNames: 0
      }),
      username: new EmailVO('john.doe@example.com', false),
      accessToken: 'gho_16C7e42F292c6912E7710c838347Ae178B4a',
      refreshToken: 'ghr_1882EdB3e71C470cbeAd9c6B5118c8bc',
      expiresIn: new Date(Date.now() + ONE_YEAR)
    })

    user
      .addOauth(oauth)
      .disableOauth(oauth.id)

    expect(user.oauths[0].disabledAt).toBeDefined()

    expect(() => user.disableOauth('id')).toThrowError(new TypeError('Invalid id'))
    expect(() => user.disableOauth(new UUID())).toThrowError(new Error('Not found'))

    user.disable()

    expect(() => user.disableOauth(oauth.id)).toThrowError(new Error('User is disabled'))
  })
  test('Given that we want to enable oauths', () => {
    const user = new User(MIN_USER)

    const oauthProvider = new OauthProvider({
      name: new Name('Github', {
        minAmountOfLastNames: 0
      }),
      clientId: '115c7faa93f26f0c4fff',
      clientSecret: 'c486cf3d8670a2fe84ded7d08abd97300845677e'
    })

    const oauth = new Oauth({
      provider: oauthProvider,
      name: new Name('John Doe', {
        minAmountOfLastNames: 0
      }),
      username: new EmailVO('john.doe@example.com', false),
      accessToken: 'gho_16C7e42F292c6912E7710c838347Ae178B4a',
      refreshToken: 'ghr_1882EdB3e71C470cbeAd9c6B5118c8bc',
      expiresIn: new Date(Date.now() + ONE_YEAR)
    })

    user
      .addOauth(oauth)
      .disableOauth(oauth.id)
      .enableOauth(oauth.id)

    expect(user.oauths[0].disabledAt).toBeUndefined()

    expect(() => user.enableOauth('id')).toThrowError(new TypeError('Invalid id'))
    expect(() => user.enableOauth(new UUID())).toThrowError(new Error('Not found'))

    user.disable()

    expect(() => user.enableOauth(oauth.id)).toThrowError(new Error('User is disabled'))
  })
  test('Given that we want to delete oauths', () => {
    const user = new User(MIN_USER)

    const oauthProvider = new OauthProvider({
      name: new Name('Github', {
        minAmountOfLastNames: 0
      }),
      clientId: '115c7faa93f26f0c4fff',
      clientSecret: 'c486cf3d8670a2fe84ded7d08abd97300845677e'
    })

    const oauth = new Oauth({
      provider: oauthProvider,
      name: new Name('John Doe', {
        minAmountOfLastNames: 0
      }),
      username: new EmailVO('john.doe@example.com', false),
      accessToken: 'gho_16C7e42F292c6912E7710c838347Ae178B4a',
      refreshToken: 'ghr_1882EdB3e71C470cbeAd9c6B5118c8bc',
      expiresIn: new Date(Date.now() + ONE_YEAR)
    })

    user.addOauth(oauth)

    expect(user.deleteOauth(new UUID())).toBeFalsy()
    expect(user.deleteOauth(oauth.id)).toBeTruthy()
    expect(user.oauths.length).toBe(0)

    expect(() => user.deleteOauth('id')).toThrowError(new TypeError('Invalid id'))

    user.disable()

    expect(() => user.deleteOauth(oauth.id)).toThrowError(new Error('User is disabled'))
  })
})
