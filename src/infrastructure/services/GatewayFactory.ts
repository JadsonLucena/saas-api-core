import { PROVIDERS, SM } from '../../config.ts'
import ICacheDB from '../ports/ICacheDB.ts'
import { ISM } from '../../application/ports/ISM.ts'

export default class GatewayFactory {
	private static _sm: ISM
	private static _cachaDB: ICacheDB

	static async SM(config: typeof SM, appName: string): Promise<ISM> {
		if (GatewayFactory._sm) return GatewayFactory._sm

		if (SM.PROVIDER && !Object.values(PROVIDERS).includes(SM.PROVIDER)) {
			throw new Error(`Invalid SM provider. Supported providers are: ${Object.values(PROVIDERS).join(', ')}`)
		}

		if (config.PROVIDER === PROVIDERS.GOOGLE) {
			const GoogleSM = (await import('../gateway/SM/Google.ts')).default

			if (config.GOOGLE.FEDERATED_TOKEN_FILE) {
				return GatewayFactory._sm = new GoogleSM({
					projectId: config[PROVIDERS.GOOGLE].PROJECT_ID,
					federatedTokenFile: config.GOOGLE.FEDERATED_TOKEN_FILE
				})
			} else if (config.GOOGLE.CREDENTIAL) {
				return GatewayFactory._sm = new GoogleSM({
					projectId: config.GOOGLE.PROJECT_ID,
					credential: config.GOOGLE.CREDENTIAL
				})
			} else {
				throw new Error(`${PROVIDERS.GOOGLE} SM credentials are required`)
			}
		} else if (config.PROVIDER === PROVIDERS.AWS) {
			const AWS = (await import('../gateway/SM/AWS.ts')).default

			if (!config.AWS.REGION) {
				throw new Error(`${PROVIDERS.AWS} SM region is required`)
			}

			if (config.AWS.FEDERATED_TOKEN_FILE) {
				if (!config.AWS.ROLE_ARN) {
					throw new Error(`${PROVIDERS.AWS} SM role ARN is required`)
				}

				return GatewayFactory._sm = new AWS({
					apiVersion: config.AWS.API_VERSION!,
					region: config.AWS.REGION,
					roleArn: config.AWS.ROLE_ARN,
					federatedTokenFile: config.AWS.FEDERATED_TOKEN_FILE,
					appName
				})
			} else if (config.AWS.CLIENT_ID && config.AWS.CLIENT_SECRET) {
				return GatewayFactory._sm = new AWS({
					apiVersion: config.AWS.API_VERSION!,
					region: config.AWS.REGION,
					accessKeyId: config.AWS.CLIENT_ID,
					secretAccessKey: config.AWS.CLIENT_SECRET
				})
			} else {
				throw new Error(`${PROVIDERS.AWS} SM credentials are required`)
			}
		} else if (config.PROVIDER === PROVIDERS.AZURE) {
			const AzureSM = (await import('../gateway/SM/Azure.ts')).default

			if (!config.AZURE.URI) {
				throw new Error(`${PROVIDERS.AZURE} SM URI is required`)
			} else if (!config.AZURE.TENANT_ID) {
				throw new Error(`${PROVIDERS.AZURE} SM tenant ID is required`)
			} else if (!config.AZURE.CLIENT_ID) {
				throw new Error(`${PROVIDERS.AZURE} SM client ID is required`)
			}

			if (config.AZURE.FEDERATED_TOKEN_FILE) {
				return GatewayFactory._sm = new AzureSM({
					uri: new URL(config.AZURE.URI),
					tenantId: config.AZURE.TENANT_ID,
					clientId: config.AZURE.CLIENT_ID,
					federatedTokenFile: config.AZURE.FEDERATED_TOKEN_FILE
				})
			} else if (config.AZURE.CLIENT_SECRET) {
				return GatewayFactory._sm = new AzureSM({
					uri: new URL(config.AZURE.URI),
					tenantId: config.AZURE.TENANT_ID,
					clientId: config.AZURE.CLIENT_ID,
					clientSecret: config.AZURE.CLIENT_SECRET
				})
			} else {
				throw new Error(`${PROVIDERS.AZURE} SM credentials are required`)
			}
		} else {
			throw new Error(`Invalid SM provider. Supported providers are: ${Object.values(PROVIDERS).join(', ')}`)
		}
	}

	static async cacheDB(maxMemory: number, connectionString?: string): Promise<ICacheDB> {
		if (GatewayFactory._cachaDB) return GatewayFactory._cachaDB

		if (connectionString?.startsWith('redis://')) {
			const Redis = (await import('../gateway/cacheDB/Redis.ts')).default

			GatewayFactory._cachaDB = new Redis(connectionString, maxMemory)
		} else {
			throw new Error('Invalid cacheDB connection string. Supported providers are: redis://')
		}

		return GatewayFactory._cachaDB
	}
}