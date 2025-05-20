import { describe } from 'node:test'

import { SM } from '../../../src/config.ts'

import AzureSM from '../../../src/infrastructure/gateway/SM/Azure.ts'
import { runSecretManagerTests } from './runSecretManagerTests.ts'

const KEY_VAULT_NAME = `api-core-test-kv`
const client = new AzureSM({
	uri: new URL(`https://${KEY_VAULT_NAME}.vault.azure.net`),
	tenantId: SM.AZURE.TENANT_ID!,
	clientId: SM.AZURE.CLIENT_ID!,
	clientSecret: SM.AZURE.CLIENT_SECRET!,
	federatedTokenFile: SM.AZURE.FEDERATED_TOKEN_FILE
})

describe('Azure SM', () => {
	runSecretManagerTests(client)
})