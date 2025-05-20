import test from 'node:test'
import assert from 'node:assert'

import JsonWebToken from '../../../src/infrastructure/gateway/JWT/JsonWebToken.ts'

const secretKey = {
	id: '1',
	value: 'test',
}

const jwt = new JsonWebToken(secretKey.value, 'xpto', {
	kid: secretKey.id
})

const payload = {
	sub: '1234567890',
	name: 'John Doe',
}

test('should sign and verify a JWT token', async () => {
	const token = jwt.sign(payload)

	assert.strictEqual(jwt.verify(token), true)
})

test('should decode a JWT token', async () => {
	const token = jwt.sign(payload)

	const decoded = jwt.decode(token, true)

	assert.strictEqual(decoded.header?.kid, secretKey.id)
	assert.strictEqual(decoded.payload.sub, payload.sub)
	assert.strictEqual(decoded.payload.name, payload.name)
})

test('should throw an error when verifying an invalid token', async () => {
	assert.throws(() => jwt.decode('invalid-token'), new Error('Invalid token'))
})