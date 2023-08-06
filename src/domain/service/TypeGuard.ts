export * from 'node:util/types'

export function isObject (value: any, atLeastOne: any[] = []): value is Object {
  return (
    value !== null &&
    typeof value === 'object' &&
    (!atLeastOne.length || atLeastOne.some(key => key in value))
  )
}

export function isNumber (value: any): value is number {
  return Number.isSafeInteger(value) || Number.isFinite(value)
}

export function isInteger (value: any): value is number {
  return Number.isSafeInteger(value)
}

export function isString (value: any): value is string {
  return typeof value === 'string'
}

export function isToken (value: any): value is string {
  return isString(value) && /^[\w.=-]+$/i.test(value)
}

export function isUndefined (value: any): value is undefined {
  return typeof value === 'undefined'
}

export function isURL (value: any): value is URL {
  return value instanceof URL
}
