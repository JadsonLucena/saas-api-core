import test, { before, describe } from 'node:test'

import { SM } from '../../../src/config.ts'

import GoogleSM from '../../../src/infrastructure/gateway/SM/Google.ts'
import { secretManagerTestFactory } from './secretManagerTestFactory.ts'

const client = new GoogleSM({
	projectId: SM.GOOGLE.PROJECT_ID,
	credential: SM.GOOGLE.CREDENTIAL!,
	federatedTokenFile: SM.GOOGLE.FEDERATED_TOKEN_FILE
})

const tests = secretManagerTestFactory(client)

describe('Google SM', () => {
	before(tests.setup)

	test('List secrets', tests.listSecrets)
	test('Get by name', tests.getByName)
	test('Get active versions', tests.getActiveVersions)
	test('Get latest active version', tests.getLatestActiveVersion)
	test('Get version by id', tests.getVersionById)
})