import test from 'node:test'
import assert from 'node:assert'

import * as ENV from '../../../src/config.ts'
import AzureSM from '../../../src/infrastructure/gateway/SM/Azure.ts'

const awsSM = new AzureSM({
	name: ENV.SM.AZURE.NAME!,
	tenantId: ENV.SM.AZURE.TENANT_ID!,
	clientId: ENV.SM.AZURE.CLIENT_ID!,
	clientSecret: ENV.SM.AZURE.CLIENT_SECRET!
})

const name = 'Test'

test('List secrets', async () => {
	const secrets: any = []

	for await (const list of awsSM.list()) {
		list.forEach(secret => secrets.push(secret))
	}

	assert.strictEqual(secrets.length >= 1, true)
	assert.strictEqual(secrets.some(secret => secret.name === name), true)
})

test('Get by name', async () => {
	const secret = await awsSM.get(name)

	assert.strictEqual(secret.name, name)
})