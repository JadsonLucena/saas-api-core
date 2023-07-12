import Name from '../../../build/domain/VO/Name.js'
import Email from '../../../build/domain/VO/Email.js'
import Phone from '../../../build/domain/VO/Phone.js'
import Password from '../../../build/domain/VO/Password.js'

import User from '../../../build/domain/entities/User.js'
import OauthProvider from '../../../build/domain/entities/OauthProvider.js'
import Oauth from '../../../build/domain/entities/Oauth.js'

const ONE_YEAR = 31622400000

const MIN_USER = {
  name: new Name('John Doe'),
  username: new Email('john.doe', false),
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

    const email = new Email('john.doe@example.com')
    const emailUpperCase = new Email('john.doe@example.com')
    const otherEmail = new Email('username@example.com')

    user.addEmail(email)

    expect(() => user.addEmail(emailUpperCase)).toThrowError(new Error('It\'s already added'))

    expect(user.emails.length).toBe(1)
    expect(user.emails).toEqual(expect.arrayContaining([
      expect.objectContaining({
        email
      })
    ]))
    expect(user.emails).not.toEqual(expect.not.arrayContaining([
      expect.objectContaining({
        email: emailUpperCase
      })
    ]))

    user.addEmail(otherEmail)

    expect(user.emails.length).toBe(2)
    expect(user.emails).toEqual(expect.arrayContaining([
      expect.objectContaining({
        email: otherEmail
      })
    ]))

    expect(() => user.addEmail(email.toString())).toThrowError(new TypeError('Invalid email'))
    expect(() => user.addEmail(new Email('login', false))).toThrowError(new TypeError('Domain required'))

    user.disable()

    expect(() => user.addEmail(otherEmail)).toThrowError(new Error('User is disabled'))
  })
  test('Given that we want to confirm emails', () => {
    const user = new User(MIN_USER)

    const email = new Email('john.doe@example.com')
    const otherEmail = new Email('username@example.com')

    user
      .addEmail(email)
      .confirmEmail(email)

    expect(user.emails[0].confirmedAt).toBeDefined()

    expect(() => user.confirmEmail(email)).toThrowError(new Error('It\'s already confirmed'))
    expect(() => user.confirmEmail(email.toString())).toThrowError(new TypeError('Invalid email'))
    expect(() => user.confirmEmail(otherEmail)).toThrowError(new Error('Not found'))

    user.disable()

    expect(() => user.confirmEmail(email)).toThrowError(new Error('User is disabled'))
  })
  test('Given that we want to disable emails', () => {
    const user = new User(MIN_USER)

    const email = new Email('john.doe@example.com')
    const otherEmail = new Email('username@example.com')

    user
      .addEmail(email)
      .disableEmail(email)

    expect(user.emails[0].disabledAt).toBeDefined()

    expect(() => user.disableEmail(email)).toThrowError(new Error('It\'s already disabled'))
    expect(() => user.disableEmail(email.toString())).toThrowError(new TypeError('Invalid email'))
    expect(() => user.disableEmail(otherEmail)).toThrowError(new Error('Not found'))

    user.disable()

    expect(() => user.disableEmail(email)).toThrowError(new Error('User is disabled'))
  })
  test('Given that we want to enable emails', () => {
    const user = new User(MIN_USER)

    const email = new Email('john.doe@example.com')
    const otherEmail = new Email('username@example.com')

    user
      .addEmail(email)
      .disableEmail(email)
      .enableEmail(email)

    expect(user.emails[0].disabledAt).toBeUndefined()

    expect(() => user.enableEmail(email)).toThrowError(new Error('It\'s already enabled'))
    expect(() => user.enableEmail(email.toString())).toThrowError(new TypeError('Invalid email'))
    expect(() => user.enableEmail(otherEmail)).toThrowError(new Error('Not found'))

    user.disable()

    expect(() => user.enableEmail(email)).toThrowError(new Error('User is disabled'))
  })
  test('Given that we want to delete emails', () => {
    const user = new User(MIN_USER)

    const email = new Email('john.doe@example.com')
    const otherEmail = new Email('username@example.com')

    user.addEmail(email)

    expect(() => user.deleteEmail(email.toString())).toThrowError(new TypeError('Invalid email'))
    expect(user.deleteEmail(otherEmail)).toBeFalsy()
    expect(user.deleteEmail(email)).toBeTruthy()
    expect(user.emails.length).toBe(0)

    user.disable()

    expect(() => user.deleteEmail(email)).toThrowError(new Error('User is disabled'))
  })

  test('Given that we want to add phones', () => {
    const user = new User(MIN_USER)

    const phone = new Phone('+0 (1) 234-5678')
    const otherPhone = new Phone('+01-234 (123) 67890-1234')

    user.addPhone(phone)

    expect(() => user.addPhone(phone)).toThrowError(new Error('It\'s already added'))

    expect(user.phones.length).toBe(1)
    expect(user.phones).toEqual(expect.arrayContaining([
      expect.objectContaining({
        phone
      })
    ]))

    expect(() => user.addPhone(phone.toString())).toThrowError(new TypeError('Invalid phone'))

    user.addPhone(otherPhone)

    expect(user.phones.length).toBe(2)
    expect(user.phones).toEqual(expect.arrayContaining([
      expect.objectContaining({
        phone: otherPhone
      })
    ]))

    user.disable()

    expect(() => user.addPhone(otherPhone)).toThrowError(new Error('User is disabled'))
  })
  test('Given that we want to confirm phones', () => {
    const user = new User(MIN_USER)

    const phone = new Phone('+0 (1) 234-5678')
    const otherPhone = new Phone('+01-234 (123) 67890-1234')

    user
      .addPhone(phone)
      .confirmPhone(phone)

    expect(user.phones[0].confirmedAt).toBeDefined()

    expect(() => user.confirmPhone(phone)).toThrowError(new Error('It\'s already confirmed'))
    expect(() => user.confirmPhone(phone.toString())).toThrowError(new TypeError('Invalid phone'))
    expect(() => user.confirmPhone(otherPhone)).toThrowError(new Error('Not found'))

    user.disable()

    expect(() => user.confirmPhone(phone)).toThrowError(new Error('User is disabled'))
  })
  test('Given that we want to disable phones', () => {
    const user = new User(MIN_USER)

    const phone = new Phone('+0 (1) 234-5678')
    const otherPhone = new Phone('+01-234 (123) 67890-1234')

    user
      .addPhone(phone)
      .disablePhone(phone)

    expect(user.phones[0].disabledAt).toBeDefined()

    expect(() => user.disablePhone(phone)).toThrowError(new Error('It\'s already disabled'))
    expect(() => user.disablePhone(phone.toString())).toThrowError(new TypeError('Invalid phone'))
    expect(() => user.disablePhone(otherPhone)).toThrowError(new Error('Not found'))

    user.disable()

    expect(() => user.disablePhone(phone)).toThrowError(new Error('User is disabled'))
  })
  test('Given that we want to enable phones', () => {
    const user = new User(MIN_USER)

    const phone = new Phone('+0 (1) 234-5678')
    const otherPhone = new Phone('+01-234 (123) 67890-1234')

    user
      .addPhone(phone)
      .disablePhone(phone)
      .enablePhone(phone)

    expect(user.phones[0].disabledAt).toBeUndefined()

    expect(() => user.enablePhone(phone)).toThrowError(new Error('It\'s already enabled'))
    expect(() => user.enablePhone(phone.toString())).toThrowError(new TypeError('Invalid phone'))
    expect(() => user.enablePhone(otherPhone)).toThrowError(new Error('Not found'))

    user.disable()

    expect(() => user.enablePhone(phone)).toThrowError(new Error('User is disabled'))
  })
  test('Given that we want to delete phones', () => {
    const user = new User(MIN_USER)

    const phone = new Phone('+0 (1) 234-5678')
    const otherPhone = new Phone('+01-234 (123) 67890-1234')

    user.addPhone(phone)

    expect(() => user.deletePhone(phone.toString())).toThrowError(new TypeError('Invalid phone'))
    expect(user.deletePhone(otherPhone)).toBeFalsy()
    expect(user.deletePhone(phone)).toBeTruthy()
    expect(user.phones.length).toBe(0)

    user.disable()

    expect(() => user.deletePhone(phone)).toThrowError(new Error('User is disabled'))
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
      username: new Email('john.doe@example.com', false),
      accessToken: 'gho_16C7e42F292c6912E7710c838347Ae178B4a',
      refreshToken: 'ghr_1882EdB3e71C470cbeAd9c6B5118c8bc',
      expiresIn: new Date(Date.now() + ONE_YEAR)
    })
    const otherOauth = new Oauth({
      provider: oauthProvider,
      name: new Name('John', {
        minAmountOfLastNames: 0
      }),
      username: new Email('john@example.com', false),
      accessToken: 'gho_16C7e42F292c6912E7710c838347Ae178B4a',
      refreshToken: 'ghr_1882EdB3e71C470cbeAd9c6B5118c8bc',
      expiresIn: new Date(Date.now() + ONE_YEAR)
    })
    const oauthUpperCase = new Oauth({
      provider: oauthProvider,
      name: new Name('John Doe', {
        minAmountOfLastNames: 0
      }),
      username: new Email('JOHN.DOE@example.com', false),
      accessToken: 'gho_16C7e42F292c6912E7710c838347Ae178B4a',
      refreshToken: 'ghr_1882EdB3e71C470cbeAd9c6B5118c8bc',
      expiresIn: new Date(Date.now() + ONE_YEAR)
    })

    user.addOauth(oauth)

    expect(() => user.addOauth(oauthUpperCase)).toThrowError(new Error('It\'s already added'))

    expect(user.oauths.length).toBe(1)
    expect(user.oauths).toContain(oauth)

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
      username: new Email('john.doe@example.com', false),
      accessToken: 'gho_16C7e42F292c6912E7710c838347Ae178B4a',
      refreshToken: 'ghr_1882EdB3e71C470cbeAd9c6B5118c8bc',
      expiresIn: new Date(Date.now() + ONE_YEAR)
    })
    const otherOauth = new Oauth({
      provider: oauthProvider,
      name: new Name('John', {
        minAmountOfLastNames: 0
      }),
      username: new Email('john@example.com', false),
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
      .updateOauth(oauth, data)

    expect(user.oauths.length).toBe(1)
    expect(user.oauths).toContain(oauth)
    expect(user.oauths[0].name).toBe(data.name)
    expect(user.oauths[0].accessToken).toBe(data.accessToken)
    expect(user.oauths[0].refreshToken).toBe(data.refreshToken)
    expect(user.oauths[0].expiresIn).toBe(data.expiresIn)

    expect(() => user.updateOauth(oauth.id, data)).toThrowError(new TypeError('Invalid oauth'))
    expect(() => user.updateOauth(otherOauth, data)).toThrowError(new Error('Not found'))

    user.disable()

    expect(() => user.updateOauth(oauth, data)).toThrowError(new Error('User is disabled'))
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
      username: new Email('john.doe@example.com', false),
      accessToken: 'gho_16C7e42F292c6912E7710c838347Ae178B4a',
      refreshToken: 'ghr_1882EdB3e71C470cbeAd9c6B5118c8bc',
      expiresIn: new Date(Date.now() + ONE_YEAR)
    })
    const otherOauth = new Oauth({
      provider: oauthProvider,
      name: new Name('John', {
        minAmountOfLastNames: 0
      }),
      username: new Email('john@example.com', false),
      accessToken: 'gho_16C7e42F292c6912E7710c838347Ae178B4a',
      refreshToken: 'ghr_1882EdB3e71C470cbeAd9c6B5118c8bc',
      expiresIn: new Date(Date.now() + ONE_YEAR)
    })

    user
      .addOauth(oauth)
      .disableOauth(oauth)

    expect(user.oauths[0].disabledAt).toBeDefined()

    expect(() => user.disableOauth(oauth.id)).toThrowError(new TypeError('Invalid oauth'))
    expect(() => user.disableOauth(oauth)).toThrowError(new Error('It\'s already disabled'))
    expect(() => user.disableOauth(otherOauth)).toThrowError(new Error('Not found'))

    user.disable()

    expect(() => user.disableOauth(oauth)).toThrowError(new Error('User is disabled'))
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
      username: new Email('john.doe@example.com', false),
      accessToken: 'gho_16C7e42F292c6912E7710c838347Ae178B4a',
      refreshToken: 'ghr_1882EdB3e71C470cbeAd9c6B5118c8bc',
      expiresIn: new Date(Date.now() + ONE_YEAR)
    })
    const otherOauth = new Oauth({
      provider: oauthProvider,
      name: new Name('John', {
        minAmountOfLastNames: 0
      }),
      username: new Email('john@example.com', false),
      accessToken: 'gho_16C7e42F292c6912E7710c838347Ae178B4a',
      refreshToken: 'ghr_1882EdB3e71C470cbeAd9c6B5118c8bc',
      expiresIn: new Date(Date.now() + ONE_YEAR)
    })

    user
      .addOauth(oauth)
      .disableOauth(oauth)
      .enableOauth(oauth)

    expect(user.oauths[0].disabledAt).toBeUndefined()

    expect(() => user.enableOauth(oauth.id)).toThrowError(new TypeError('Invalid oauth'))
    expect(() => user.enableOauth(oauth)).toThrowError(new Error('It\'s already enabled'))
    expect(() => user.enableOauth(otherOauth)).toThrowError(new Error('Not found'))

    user.disable()

    expect(() => user.enableOauth(oauth)).toThrowError(new Error('User is disabled'))
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
      username: new Email('john.doe@example.com', false),
      accessToken: 'gho_16C7e42F292c6912E7710c838347Ae178B4a',
      refreshToken: 'ghr_1882EdB3e71C470cbeAd9c6B5118c8bc',
      expiresIn: new Date(Date.now() + ONE_YEAR)
    })
    const otherOauth = new Oauth({
      provider: oauthProvider,
      name: new Name('John', {
        minAmountOfLastNames: 0
      }),
      username: new Email('john@example.com', false),
      accessToken: 'gho_16C7e42F292c6912E7710c838347Ae178B4a',
      refreshToken: 'ghr_1882EdB3e71C470cbeAd9c6B5118c8bc',
      expiresIn: new Date(Date.now() + ONE_YEAR)
    })

    user.addOauth(oauth)

    expect(user.deleteOauth(otherOauth)).toBeFalsy()
    expect(user.deleteOauth(oauth)).toBeTruthy()
    expect(user.oauths.length).toBe(0)

    expect(() => user.deleteOauth(oauth.id)).toThrowError(new TypeError('Invalid oauth'))

    user.disable()

    expect(() => user.deleteOauth(oauth)).toThrowError(new Error('User is disabled'))
  })
})
