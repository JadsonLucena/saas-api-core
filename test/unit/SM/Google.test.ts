import test from 'node:test'
import assert from 'node:assert'

import * as ENV from '../../../src/config.ts'
import GoogleSM from '../../../src/infrastructure/gateway/SM/Google.ts'

const googleSM = new GoogleSM({
	credential: ENV.SM.GOOGLE.CREDENTIAL!
})

const name = 'projects/33703432303/secrets/Test'

test('List secrets', async () => {
	const secrets: any = []

	for await (const list of googleSM.list()) {
		list.forEach(secret => secrets.push(secret))
	}

	assert.strictEqual(secrets.length, 1)
	assert.strictEqual(secrets[0].name, name)
})

test('Get by name', async () => {
	const secret = await googleSM.get(name)

	assert.strictEqual(secret.name, name)
})