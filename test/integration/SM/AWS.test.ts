import test, { before, describe } from 'node:test'

import { SM, APP_NAME } from '../../../src/config.ts'

import AwsSM from '../../../src/infrastructure/gateway/SM/AWS.ts'
import { secretManagerTestFactory } from './secretManagerTestFactory.ts'

const client = new AwsSM({
	apiVersion: SM.AWS.API_VERSION!,
	region: SM.AWS.REGION!,
	accessKeyId: SM.AWS.CLIENT_ID!,
	secretAccessKey: SM.AWS.CLIENT_SECRET!,
	federatedTokenFile: SM.AWS.FEDERATED_TOKEN_FILE,
	roleArn: SM.AWS.ROLE_ARN,
	appName: APP_NAME
})

const tests = secretManagerTestFactory(client)

describe('AWS SM', () => {
	before(tests.setup)

	test('List secrets', tests.listSecrets)
	test('Get by name', tests.getByName)
	test('Get active versions', tests.getActiveVersions)
	test('Get latest active version', tests.getLatestActiveVersion)
	test('Get version by id', tests.getVersionById)
})