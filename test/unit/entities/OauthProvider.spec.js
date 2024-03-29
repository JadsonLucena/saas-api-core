import UUID from '../../../build/domain/VO/UUID.js'
import Name from '../../../build/domain/VO/Name.js'

import OauthProvider from '../../../build/domain/entities/OauthProvider.js'

const MIN_OAUTH_PROVIDER = {
  name: new Name('Github', {
    minAmountOfLastNames: 0
  }),
  clientId: '115c7faa93f26f0c4fff',
  clientSecret: 'c486cf3d8670a2fe84ded7d08abd97300845677e'
}
const MAX_OAUTH_PROVIDER = {
  name: new Name('Linkedin', {
    minAmountOfLastNames: 0
  }),
  id: new UUID(),
  picture: new URL('https://cdn.example.com/oauth/linkedin.webp'),
  clientId: '28cjjwaxaz7c15',
  clientSecret: 'OaNGp7Lf9AKmJ4Se',
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
  false,
  null
]

describe('Constructor', () => {
  test('Given that one wants to instantiate the object with an invalid argument', () => {
    INVALID_INPUT_TYPES.concat(undefined).forEach(input => {
      expect(() => new OauthProvider(input)).toThrowError()
    })

    INVALID_INPUT_TYPES.concat(undefined).forEach(input => {
      expect(() => new OauthProvider({
        ...MAX_OAUTH_PROVIDER,
        name: input
      })).toThrowError(new TypeError('Invalid name'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new OauthProvider({
        ...MAX_OAUTH_PROVIDER,
        picture: input
      })).toThrowError(new TypeError('Invalid picture'))
    })
    INVALID_INPUT_TYPES.concat(undefined).forEach(input => {
      expect(() => new OauthProvider({
        ...MAX_OAUTH_PROVIDER,
        clientId: input
      })).toThrowError(new TypeError('Invalid clientId'))
    })
    INVALID_INPUT_TYPES.concat(undefined).forEach(input => {
      expect(() => new OauthProvider({
        ...MAX_OAUTH_PROVIDER,
        clientSecret: input
      })).toThrowError(new TypeError('Invalid clientSecret'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new OauthProvider({
        ...MAX_OAUTH_PROVIDER,
        updatedAt: input
      })).toThrowError(new TypeError('Invalid updatedAt'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new OauthProvider({
        ...MAX_OAUTH_PROVIDER,
        disabledAt: input
      })).toThrowError(new TypeError('Invalid disabledAt'))
    })

    // expect(() => new OauthProvider({
    //   name: INVALID_INPUT_TYPES.concat(undefined)[Math.floor(Math.random() * INVALID_INPUT_TYPES.concat(undefined).length)],
    //   picture: INVALID_INPUT_TYPES[Math.floor(Math.random() * INVALID_INPUT_TYPES.length)],
    //   clientId: INVALID_INPUT_TYPES.concat(undefined)[Math.floor(Math.random() * INVALID_INPUT_TYPES.concat(undefined).length)],
    //   clientSecret: INVALID_INPUT_TYPES.concat(undefined)[Math.floor(Math.random() * INVALID_INPUT_TYPES.concat(undefined).length)],
    //   updatedAt: INVALID_INPUT_TYPES[Math.floor(Math.random() * INVALID_INPUT_TYPES.length)],
    //   disabledAt: INVALID_INPUT_TYPES[Math.floor(Math.random() * INVALID_INPUT_TYPES.length)]
    // })).toThrow(AggregateError)
  })

  test('Given that one wants to instantiate the object with a valid argument', () => {
    expect(() => new OauthProvider(MIN_OAUTH_PROVIDER)).not.toThrow()
    expect(() => new OauthProvider(MAX_OAUTH_PROVIDER)).not.toThrow()

    const minOauthProvider = new OauthProvider(MIN_OAUTH_PROVIDER)
    expect(minOauthProvider.createdAt).toEqual(minOauthProvider.updatedAt)
  })
})

describe('Attributes', () => {
  test('Given that we want to check for entity update whenever an attribute is updated', () => {
    const oauthProvider = new OauthProvider(MIN_OAUTH_PROVIDER)

    let updatedAt = oauthProvider.updatedAt
    oauthProvider.name = MAX_OAUTH_PROVIDER.name
    expect(oauthProvider.name).toBe(MAX_OAUTH_PROVIDER.name)
    expect(oauthProvider.updatedAt).not.toBe(updatedAt)

    updatedAt = oauthProvider.updatedAt
    oauthProvider.picture = MAX_OAUTH_PROVIDER.picture
    expect(oauthProvider.picture).toBe(MAX_OAUTH_PROVIDER.picture)
    expect(oauthProvider.updatedAt).not.toBe(updatedAt)

    updatedAt = oauthProvider.updatedAt
    oauthProvider.clientId = MAX_OAUTH_PROVIDER.clientId
    expect(oauthProvider.clientId).toBe(MAX_OAUTH_PROVIDER.clientId)
    expect(oauthProvider.updatedAt).not.toBe(updatedAt)

    updatedAt = oauthProvider.updatedAt
    oauthProvider.clientSecret = MAX_OAUTH_PROVIDER.clientSecret
    expect(oauthProvider.clientSecret).toBe(MAX_OAUTH_PROVIDER.clientSecret)
    expect(oauthProvider.updatedAt).not.toBe(updatedAt)

    updatedAt = oauthProvider.updatedAt
    oauthProvider.disable()
    expect(oauthProvider.disabledAt).toBe(oauthProvider.updatedAt)
    expect(oauthProvider.updatedAt).not.toBe(updatedAt)

    updatedAt = oauthProvider.updatedAt
    oauthProvider.enable()
    expect(oauthProvider.disabledAt).toBeUndefined()
    expect(oauthProvider.updatedAt).not.toBe(updatedAt)
  })
  test('Given that we want to disable the entity', () => {
    const oauthProvider = new OauthProvider(MIN_OAUTH_PROVIDER)

    oauthProvider.disable()

    expect(() => {
      oauthProvider.name = MAX_OAUTH_PROVIDER.name
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      oauthProvider.picture = MAX_OAUTH_PROVIDER.picture
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      oauthProvider.clientId = MAX_OAUTH_PROVIDER.clientId
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      oauthProvider.clientSecret = MAX_OAUTH_PROVIDER.clientSecret
    }).toThrowError(new Error('It\'s disabled'))
    expect(() => {
      oauthProvider.disable()
    }).toThrowError(new Error('It\'s already disabled'))

    expect(() => {
      oauthProvider.enable()
    }).not.toThrow()
    expect(() => {
      oauthProvider.enable()
    }).toThrowError(new Error('It\'s already enabled'))

    expect(oauthProvider.disabledAt).toBeUndefined()
  })
})
