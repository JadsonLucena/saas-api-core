import UUID from '../../../build/domain/VO/UUID.js'
import Email from '../../../build/domain/VO/Email.js'
import Name from '../../../build/domain/VO/Name.js'

import OauthProvider from '../../../build/domain/entities/OauthProvider.js'
import Oauth from '../../../build/domain/entities/Oauth.js'

const ONE_YEAR = 31622400000

const OAUTH_PROVIDER = new OauthProvider({
  name: new Name('Github', {
    minAmountOfLastNames: 0
  }),
  clientId: '115c7faa93f26f0c4fff',
  clientSecret: 'c486cf3d8670a2fe84ded7d08abd97300845677e'
})
const MIN_OAUTH = {
  provider: OAUTH_PROVIDER,
  name: new Name('John Doe', {
    minAmountOfLastNames: 0
  }),
  username: new Email('john.doe@example.com'),
  accessToken: 'gho_16C7e42F292c6912E7710c838347Ae178B4a',
  refreshToken: 'ghr_1882EdB3e71C470cbeAd9c6B5118c8bc',
  expiresIn: new Date(Date.now() + ONE_YEAR)
}
const MAX_OAUTH = {
  ...MIN_OAUTH,
  id: new UUID(),
  picture: new URL('https://cdn.example.com/oauth/profile/userId.webp'),
  createdAt: new Date(),
  updatedAt: new Date()
  // disabledAt: new Date()
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
    INVALID_INPUT_TYPES.concat(undefined, null).forEach(input => {
      expect(() => new Oauth(input)).toThrowError()
    })

    INVALID_INPUT_TYPES.concat(undefined, null).forEach(input => {
      expect(() => new Oauth({
        ...MAX_OAUTH,
        provider: input
      })).toThrowError(new TypeError('Invalid provider'))
    })
    INVALID_INPUT_TYPES.concat(undefined, null).forEach(input => {
      expect(() => new Oauth({
        ...MAX_OAUTH,
        name: input
      })).toThrowError(new TypeError('Invalid name'))
    })
    INVALID_INPUT_TYPES.concat(undefined, null).forEach(input => {
      expect(() => new Oauth({
        ...MAX_OAUTH,
        username: input
      })).toThrowError(new TypeError('Invalid username'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new Oauth({
        ...MAX_OAUTH,
        picture: input
      })).toThrowError(new TypeError('Invalid picture'))
    })
    INVALID_INPUT_TYPES.concat(undefined, null).forEach(input => {
      expect(() => new Oauth({
        ...MAX_OAUTH,
        accessToken: input
      })).toThrowError(new TypeError('Invalid accessToken'))
    })
    INVALID_INPUT_TYPES.concat(undefined, null).forEach(input => {
      expect(() => new Oauth({
        ...MAX_OAUTH,
        refreshToken: input
      })).toThrowError(new TypeError('Invalid refreshToken'))
    })
    INVALID_INPUT_TYPES.concat(undefined, null).filter(input => input != null).forEach(input => {
      expect(() => new Oauth({
        ...MAX_OAUTH,
        expiresIn: input
      })).toThrowError(new TypeError('Invalid expiresIn'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new Oauth({
        ...MAX_OAUTH,
        updatedAt: input
      })).toThrowError(new TypeError('Invalid updatedAt'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new Oauth({
        ...MAX_OAUTH,
        disabledAt: input
      })).toThrowError(new TypeError('Invalid disabledAt'))
    })

    // expect(() => new Oauth({
    //   name: INVALID_INPUT_TYPES.concat(undefined, null)[Math.floor(Math.random() * INVALID_INPUT_TYPES.concat(undefined, null).length)],
    //   picture: INVALID_INPUT_TYPES[Math.floor(Math.random() * INVALID_INPUT_TYPES.length)],
    //   clientId: INVALID_INPUT_TYPES.concat(undefined, null)[Math.floor(Math.random() * INVALID_INPUT_TYPES.concat(undefined, null).length)],
    //   clientSecret: INVALID_INPUT_TYPES.concat(undefined, null)[Math.floor(Math.random() * INVALID_INPUT_TYPES.concat(undefined, null).length)],
    //   updatedAt: INVALID_INPUT_TYPES[Math.floor(Math.random() * INVALID_INPUT_TYPES.length)],
    //   disabledAt: INVALID_INPUT_TYPES[Math.floor(Math.random() * INVALID_INPUT_TYPES.length)]
    // })).toThrow(AggregateError)
  })

  test('Given that one wants to instantiate the object with a valid argument', () => {
    expect(() => new Oauth(MIN_OAUTH)).not.toThrow()
    expect(() => new Oauth(MAX_OAUTH)).not.toThrow()

    const maxOauth = new Oauth(MAX_OAUTH)
    expect(maxOauth.provider).toBe(MAX_OAUTH.provider)
    expect(maxOauth.username).toBe(MAX_OAUTH.username)

    const minOauth = new Oauth(MIN_OAUTH)
    expect(minOauth.createdAt).toEqual(minOauth.updatedAt)
  })
})

describe('Attributes', () => {
  test('Given that we want to try to update readonly attributes', () => {
    const oauth = new Oauth(MIN_OAUTH)

    expect(() => {
      oauth.provider = OAUTH_PROVIDER
    }).toThrow()
    expect(() => {
      oauth.username = new Email('username@example.com')
    }).toThrow()
  })
  test('Given that we want to check for entity update whenever an attribute is updated', () => {
    const oauth = new Oauth(MIN_OAUTH)

    let updatedAt = oauth.updatedAt
    oauth.name = MAX_OAUTH.name
    expect(oauth.name).toBe(MAX_OAUTH.name)
    expect(oauth.updatedAt).not.toBe(updatedAt)

    updatedAt = oauth.updatedAt
    oauth.picture = MAX_OAUTH.picture
    expect(oauth.picture).toBe(MAX_OAUTH.picture)
    expect(oauth.updatedAt).not.toBe(updatedAt)

    updatedAt = oauth.updatedAt
    oauth.accessToken = MAX_OAUTH.accessToken
    expect(oauth.accessToken).toBe(MAX_OAUTH.accessToken)
    expect(oauth.updatedAt).not.toBe(updatedAt)

    updatedAt = oauth.updatedAt
    oauth.refreshToken = MAX_OAUTH.refreshToken
    expect(oauth.refreshToken).toBe(MAX_OAUTH.refreshToken)
    expect(oauth.updatedAt).not.toBe(updatedAt)

    updatedAt = oauth.updatedAt
    oauth.expiresIn = MAX_OAUTH.expiresIn
    expect(oauth.expiresIn).toBe(MAX_OAUTH.expiresIn)
    expect(oauth.updatedAt).not.toBe(updatedAt)

    oauth.updatedAt = MAX_OAUTH.updatedAt
    expect(oauth.updatedAt).toBe(MAX_OAUTH.updatedAt)

    updatedAt = oauth.updatedAt
    oauth.disabledAt = MAX_OAUTH.disabledAt
    expect(oauth.disabledAt).toBe(MAX_OAUTH.disabledAt)
    expect(oauth.updatedAt).not.toBe(updatedAt)
  })
  test('Given that we want to disable the entity', () => {
    const oauth = new Oauth(MIN_OAUTH)

    oauth.disabledAt = new Date()

    expect(() => {
      oauth.name = MAX_OAUTH.name
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      oauth.picture = MAX_OAUTH.picture
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      oauth.accessToken = MAX_OAUTH.accessToken
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      oauth.refreshToken = MAX_OAUTH.refreshToken
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      oauth.expiresIn = MAX_OAUTH.expiresIn
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      oauth.updatedAt = MAX_OAUTH.updatedAt
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      oauth.disabledAt = new Date()
    }).toThrowError(new Error('It\'s already disabled'))

    expect(() => {
      oauth.disabledAt = undefined
    }).not.toThrow()

    expect(oauth.disabledAt).toBeUndefined()
  })
})
