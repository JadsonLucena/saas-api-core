import test from 'node:test'
import assert from 'node:assert'

import JsonWebToken from '../../../src/infrastructure/gateway/JWT/JsonWebToken.ts'

const secretKey = {
	id: '1',
	value: 'test',
}

const JWT = new JsonWebToken(secretKey.value, 'xpto', {
	kid: secretKey.id
})

const payload = {
	sub: '1234567890',
	name: 'John Doe',
}

test('should sign and verify a JWT token', async () => {
	const token = JWT.sign(payload)

	assert.strictEqual(JWT.verify(token), true)
})

test('should decode a JWT token', async () => {
	const token = JWT.sign(payload)

	const decoded = JWT.decode(token, true)

	assert.strictEqual(decoded.header?.kid, secretKey.id)
	assert.strictEqual(decoded.payload.sub, payload.sub)
	assert.strictEqual(decoded.payload.name, payload.name)
})

test('should throw an error when verifying an invalid token', async () => {
	const token = JWT.sign(payload)

	assert.throws(() => JWT.decode('invalid-token'), new Error('Invalid token'))
})