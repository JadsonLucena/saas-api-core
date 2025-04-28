import test from 'node:test'
import assert from 'node:assert'

import * as ENV from '../../../src/config.ts'
import AwsSM from '../../../src/infrastructure/gateway/SM/AWS.ts'

const awsSM = new AwsSM({
	apiVersion: ENV.SM.AWS.API_VERSION!,
	region: ENV.SM.AWS.REGION!,
	accessKeyId: ENV.SM.AWS.CLIENT_ID!,
	secretAccessKey: ENV.SM.AWS.CLIENT_SECRET!
})

const name = 'dev'

test('List secrets', async () => {
	const secrets: any = []

	for await (const list of awsSM.list()) {
		list.forEach(secret => secrets.push(secret))
	}

	assert.strictEqual(secrets.length, 1)
	assert.strictEqual(secrets[0].name, name)
})

test('Get by name', async () => {
	const secret = await awsSM.get(name)

	assert.strictEqual(secret.name, name)
})