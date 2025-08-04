import { PROVIDERS, SM } from '../../config.ts'
import type ICacheDB from '../ports/ICacheDB.ts'
import type { ISM } from '../../application/ports/ISM.ts'
import type { ISqlDriver } from '../../application/ports/ISqlDriver.ts'

export default class GatewayFactory {
	private static _sm: Record<PROVIDERS, ISM> = {} as Record<PROVIDERS, ISM>
	private static _cachaDB: Record<string, ICacheDB> = {}
	private static _sqlDriver: Record<string, ISqlDriver> = {}

	static async SM(props: typeof SM, appName: string) {
		if (!props.PROVIDER) {
			return undefined
		}

		if (GatewayFactory._sm[props.PROVIDER]) return GatewayFactory._sm[props.PROVIDER]

		GatewayFactory._sm[props.PROVIDER] = await GatewayFactory.createSMProvider(props, appName)

		return GatewayFactory._sm[props.PROVIDER]
	}

	private static async createSMProvider(config: typeof SM, appName: string) {
		if (config.PROVIDER && !Object.values(PROVIDERS).includes(config.PROVIDER)) {
			throw new Error(`Invalid SM provider. Supported providers are: ${Object.values(PROVIDERS).join(', ')}`)
		} else if (config.PROVIDER === PROVIDERS.AZURE) {
			return await GatewayFactory.createAzureSM(config)
		} else if (config.PROVIDER === PROVIDERS.AWS) {
			return await GatewayFactory.createAWSSM(config, appName)
		}

		return await GatewayFactory.createGoogleSM(config)
	}

	private static async createGoogleSM(config: typeof SM) {
		const GoogleSM = (await import('../gateway/SM/Google.ts')).default

		if (config.GOOGLE.FEDERATED_TOKEN_FILE) {
			return new GoogleSM({
				projectId: config.GOOGLE.PROJECT_ID!,
				federatedTokenFile: config.GOOGLE.FEDERATED_TOKEN_FILE
			})
		}

		if (config.GOOGLE.CREDENTIAL) {
			return new GoogleSM({
				projectId: config.GOOGLE.PROJECT_ID!,
				credential: config.GOOGLE.CREDENTIAL
			})
		}

		throw new Error(`${PROVIDERS.GOOGLE} SM credentials are required`)
	}

	private static async createAWSSM(config: typeof SM, appName: string) {
		const AWS = (await import('../gateway/SM/AWS.ts')).default

		GatewayFactory.validateAWSConfig(config)

		if (config.AWS.FEDERATED_TOKEN_FILE) {
			return new AWS({
				apiVersion: config.AWS.API_VERSION!,
				region: config.AWS.REGION!,
				roleArn: config.AWS.ROLE_ARN!,
				federatedTokenFile: config.AWS.FEDERATED_TOKEN_FILE,
				appName
			})
		}

		if (config.AWS.CLIENT_ID && config.AWS.CLIENT_SECRET) {
			return new AWS({
				apiVersion: config.AWS.API_VERSION!,
				region: config.AWS.REGION!,
				accessKeyId: config.AWS.CLIENT_ID,
				secretAccessKey: config.AWS.CLIENT_SECRET
			})
		}

		throw new Error(`${PROVIDERS.AWS} SM credentials are required`)
	}

	private static validateAWSConfig(config: typeof SM): void {
		if (!config.AWS.REGION) {
			throw new Error(`${PROVIDERS.AWS} SM region is required`)
		}

		if (config.AWS.FEDERATED_TOKEN_FILE && !config.AWS.ROLE_ARN) {
			throw new Error(`${PROVIDERS.AWS} SM role ARN is required`)
		}
	}

	private static async createAzureSM(config: typeof SM) {
		const AzureSM = (await import('../gateway/SM/Azure.ts')).default

		GatewayFactory.validateAzureConfig(config)

		if (config.AZURE.FEDERATED_TOKEN_FILE) {
			return new AzureSM({
				uri: new URL(config.AZURE.URI!),
				tenantId: config.AZURE.TENANT_ID!,
				clientId: config.AZURE.CLIENT_ID!,
				federatedTokenFile: config.AZURE.FEDERATED_TOKEN_FILE
			})
		}

		if (config.AZURE.CLIENT_SECRET) {
			return new AzureSM({
				uri: new URL(config.AZURE.URI!),
				tenantId: config.AZURE.TENANT_ID!,
				clientId: config.AZURE.CLIENT_ID!,
				clientSecret: config.AZURE.CLIENT_SECRET
			})
		}

		throw new Error(`${PROVIDERS.AZURE} SM credentials are required`)
	}

	private static validateAzureConfig(config: typeof SM): void {
		if (!config.AZURE.URI) {
			throw new Error(`${PROVIDERS.AZURE} SM URI is required`)
		}
		if (!config.AZURE.TENANT_ID) {
			throw new Error(`${PROVIDERS.AZURE} SM tenant ID is required`)
		}
		if (!config.AZURE.CLIENT_ID) {
			throw new Error(`${PROVIDERS.AZURE} SM client ID is required`)
		}
	}

	static async cacheDB({
		connectionString = ':memory:',
		maxMemory
	}: {
		connectionString?: string,
		maxMemory?: number
	} = {}): Promise<ICacheDB> {
		if (GatewayFactory._cachaDB[connectionString]) return GatewayFactory._cachaDB[connectionString]

		GatewayFactory._cachaDB[connectionString] = await GatewayFactory.createCacheDBProvider({
			connectionString,
			maxMemory
		})

		return GatewayFactory._cachaDB[connectionString]
	}

	private static async createCacheDBProvider(props: {
		connectionString?: string,
		maxMemory?: number
	}) {
		if (props.connectionString?.startsWith('redis://')) {
			const Redis = (await import('../gateway/cacheDB/Redis.ts')).default
			return new Redis(props.connectionString, props.maxMemory)
		} else if (props.connectionString?.startsWith('memcached://')) {
			const Memcached = (await import('../gateway/cacheDB/Memcached.ts')).default
			return new Memcached(props.connectionString.replace(/^memcached:\/\//, ''))
		}

		// Fallback to InMemory
		const InMemory = (await import('../gateway/cacheDB/InMemory.ts')).default
		return new InMemory(props.maxMemory)
	}

	static async sqlDriver(props: {
		connectionString: string
		maxPoolSize?: number,
		minPoolSize?: number,
		maxIdleTime?: number
	}) {
		if (GatewayFactory._sqlDriver[props.connectionString]) return GatewayFactory._sqlDriver[props.connectionString]

		if (props.connectionString.startsWith('mysql')) {
			const MySqlDriver = (await import('../gateway/DB/driver/sql/MySqlDriver.ts')).default
			GatewayFactory._sqlDriver[props.connectionString] = new MySqlDriver(props.connectionString, {
				maxPoolSize: props.maxPoolSize,
				minPoolSize: props.minPoolSize,
				maxIdleTime: props.maxIdleTime
			})
		} else if (props.connectionString.startsWith('postgres')) {
			const PostgreSQLDriver = (await import('../gateway/DB/driver/sql/PostgreSqlDriver.ts')).default
			GatewayFactory._sqlDriver[props.connectionString] = new PostgreSQLDriver(props.connectionString, {
				maxPoolSize: props.maxPoolSize,
				minPoolSize: props.minPoolSize,
				maxIdleTime: props.maxIdleTime
			})
		} else if (props.connectionString.startsWith('mssql')) {
			const SqlServerDriver = (await import('../gateway/DB/driver/sql/SqlServerDriver.ts')).default
			GatewayFactory._sqlDriver[props.connectionString] = new SqlServerDriver(props.connectionString, {
				maxPoolSize: props.maxPoolSize,
				minPoolSize: props.minPoolSize,
				maxIdleTime: props.maxIdleTime
			})
		}

		return GatewayFactory._sqlDriver[props.connectionString]
	}
}