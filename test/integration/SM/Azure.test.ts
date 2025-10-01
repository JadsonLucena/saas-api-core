import test, { before, describe } from 'node:test'

import { SM } from '../../../src/config.ts'

import AzureSM from '../../../src/infrastructure/gateway/SM/Azure.ts'
import { secretManagerTestFactory } from './secretManagerTestFactory.ts'

const KEY_VAULT_NAME = `api-core-test-kv`
const client = new AzureSM({
	uri: new URL(`https://${KEY_VAULT_NAME}.vault.azure.net`),
	tenantId: SM.AZURE.TENANT_ID!,
	clientId: SM.AZURE.CLIENT_ID!,
	clientSecret: SM.AZURE.CLIENT_SECRET!,
	federatedTokenFile: SM.AZURE.FEDERATED_TOKEN_FILE
})

const tests = secretManagerTestFactory(client)

describe('Azure SM', () => {
	before(tests.setup)

	test('List secrets', tests.listSecrets)
	test('Get by name', tests.getByName)
	test('Get active versions', tests.getActiveVersions)
	test('Get latest active version', tests.getLatestActiveVersion)
	test('Get version by id', tests.getVersionById)
})