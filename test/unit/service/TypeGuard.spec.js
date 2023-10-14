import { isObject, isNumber, isInteger, isString, isToken, isUndefined, isURL } from '../../../build/domain/service/TypeGuard.js'

const INPUT_TYPES = [
  {},
  [],
  '',
  0,
  Infinity,
  NaN,
  false,
  null
]

test('Given that one wants to test the type guard with an invalid argument', () => {
  INPUT_TYPES.filter(input => typeof input !== 'object').forEach(input => {
    expect(isObject(input)).toBeFalsy()
  })
  expect(isObject({
    name: 'John Doe',
    age: 30,
    email: 'john.doe@example.com'
  }, ['foo', 'bar'])).toBeFalsy()
  INPUT_TYPES.filter(input => !Number.isInteger(input)).forEach(input => {
    expect(isNumber(input)).toBeFalsy()
  })
  INPUT_TYPES.concat(1.1).filter(input => !Number.isInteger(input)).forEach(input => {
    expect(isInteger(input)).toBeFalsy()
  })
  INPUT_TYPES.filter(input => typeof input !== 'string').forEach(input => {
    expect(isString(input)).toBeFalsy()
  })
  INPUT_TYPES.forEach(input => {
    expect(isToken(input)).toBeFalsy()
  })
  INPUT_TYPES.filter(input => typeof input !== 'undefined').forEach(input => {
    expect(isUndefined(input)).toBeFalsy()
  })
  INPUT_TYPES.forEach(input => {
    expect(isURL(input)).toBeFalsy()
  })
})

test('Given that one wants to test the type guard with an valid argument', () => {
  expect(isObject({})).toBeTruthy()
  expect(isObject([])).toBeTruthy()
  expect(isObject({
    name: 'John Doe',
    age: 30,
    email: 'john.doe@example.com'
  }, ['name'])).toBeTruthy()
  expect(isNumber(5.2)).toBeTruthy()
  expect(isInteger(9999)).toBeTruthy()
  expect(isString('')).toBeTruthy()
  expect(isString('example')).toBeTruthy()
  expect(isToken(Buffer.from('example').toString('base64'))).toBeTruthy()
  expect(isUndefined(undefined)).toBeTruthy()
  expect(isURL(new URL('https://example.com'))).toBeTruthy()
})
