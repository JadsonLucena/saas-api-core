import { describe } from 'node:test'

import { SM } from '../../../src/config.ts'

import GoogleSM from '../../../src/infrastructure/gateway/SM/Google.ts'
import { runSecretManagerTests } from './runSecretManagerTests.ts'

const client = new GoogleSM({
	projectId: SM.GOOGLE.PROJECT_ID,
	credential: SM.GOOGLE.CREDENTIAL!,
	federatedTokenFile: SM.GOOGLE.FEDERATED_TOKEN_FILE
})

describe('Google SM', () => {
	runSecretManagerTests(client)
})