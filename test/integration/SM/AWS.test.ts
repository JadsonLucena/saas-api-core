import { describe } from 'node:test'

import { SM, APP_NAME } from '../../../src/config.ts'

import AwsSM from '../../../src/infrastructure/gateway/SM/AWS.ts'
import { runSecretManagerTests } from './runSecretManagerTests.ts'

const client = new AwsSM({
	apiVersion: SM.AWS.API_VERSION!,
	region: SM.AWS.REGION!,
	accessKeyId: SM.AWS.CLIENT_ID!,
	secretAccessKey: SM.AWS.CLIENT_SECRET!,
	federatedTokenFile: SM.AWS.FEDERATED_TOKEN_FILE,
	roleArn: SM.AWS.ROLE_ARN,
	appName: APP_NAME
})

describe('AWS SM', () => {
  runSecretManagerTests(client)
})