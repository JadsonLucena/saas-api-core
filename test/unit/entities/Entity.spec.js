import UUID from '../../../build/domain/VO/UUID.js'

import Entity from '../../../build/domain/entities/Entity.js'

class Test extends Entity {
  constructor ({
    id,
    createdAt
  }) {
    super({
      id,
      createdAt
    })
  }
}

const INVALID_INPUT_TYPES = [
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
    // INVALID_INPUT_TYPES.forEach(input => {
    //   expect(() => new Test(input)).toThrowError()
    // })

    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new Test({
        id: input
      })).toThrowError(new TypeError('Invalid id'))
    })
    INVALID_INPUT_TYPES.forEach(input => {
      expect(() => new Test({
        createdAt: input
      })).toThrowError(new TypeError('Invalid createdAt'))
    })
  })

  test('Given that one wants to instantiate the object with a valid argument', () => {
    expect(() => new Test({})).not.toThrow()

    const id = new UUID()
    const createdAt = new Date()

    expect(() => new Test({
      id
    })).not.toThrow()
    expect(() => new Test({
      createdAt
    })).not.toThrow()

    const test = new Test({
      id,
      createdAt
    })

    expect(test.id).toBe(id)
    expect(test.createdAt).toBe(createdAt)
  })
})
describe('Attributes', () => {
  test('Given that we want to try to update readonly attributes', () => {
    const test = new Test({})

    expect(() => {
      test.id = new UUID()
    }).toThrow()
    expect(() => {
      test.createdAt = new Date()
    }).toThrow()
  })
})
