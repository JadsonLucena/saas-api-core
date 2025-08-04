import { DB } from '../../../../../config.ts'

import { type ISqlDriver, type ITransactionDriver, type Result, type Params, TRANSACTION_ISOLATION_LEVELS } from '../../../../../application/ports/ISqlDriver.ts'
import { waitForDatabase } from '../waitForDatabase.ts'

import mssql, { type ConnectionPool as ConnectionPoolType, type Transaction as TransactionType } from 'mssql'
const { ConnectionPool, Request, Transaction, ISOLATION_LEVEL } = mssql

export default class SqlServerDriver implements ISqlDriver {
	private readonly connectionString: string
	private readonly poolOptions: {
		minPoolSize?: number,
		maxPoolSize?: number,
		maxIdleTime?: number
	}

	constructor(connectionString: string, props: {
		minPoolSize?: number,
		maxPoolSize?: number,
		maxIdleTime?: number
	} = {}) {
		this.connectionString = connectionString
		this.poolOptions = props
	}

	async query<T extends Result = Record<string, Buffer | Date | bigint | boolean | null | number | string>>(
		sql: string,
		params: Params = {}
	) {
		const pool = await PoolSingleton.getPool(this.connectionString, this.poolOptions)
		const request = new Request(pool)

		Object.entries(params).forEach(([key, value]) => {
			request.input(key, value)
		})

		const result = await request.query<T>(sql)
		return result.recordset || []
	}

	async beginTransaction(isolationLevel: TRANSACTION_ISOLATION_LEVELS = TRANSACTION_ISOLATION_LEVELS.READ_COMMITTED): Promise<ITransactionDriver> {
		const pool = await PoolSingleton.getPool(this.connectionString, this.poolOptions)
		const transaction = new Transaction(pool)

		const isolationLevelMap = {
			[TRANSACTION_ISOLATION_LEVELS.READ_UNCOMMITTED]: ISOLATION_LEVEL.READ_UNCOMMITTED,
			[TRANSACTION_ISOLATION_LEVELS.READ_COMMITTED]: ISOLATION_LEVEL.READ_COMMITTED,
			[TRANSACTION_ISOLATION_LEVELS.REPEATABLE_READ]: ISOLATION_LEVEL.REPEATABLE_READ,
			[TRANSACTION_ISOLATION_LEVELS.SERIALIZABLE]: ISOLATION_LEVEL.SERIALIZABLE
		}

		await transaction.begin(isolationLevelMap[isolationLevel])

		return new SqlServerTransactionDriver(transaction)
	}

	async disconnect() {
		await PoolSingleton.disconnect()
	}
}

class SqlServerTransactionDriver implements ITransactionDriver {
	private readonly transaction: TransactionType

	constructor(transaction: TransactionType) {
		this.transaction = transaction
	}

	async query<T extends Result = Record<string, Buffer | Date | bigint | boolean | null | number | string>>(
		sql: string,
		params: Params = {}
	) {
		const request = new Request(this.transaction)

		Object.entries(params).forEach(([key, value]) => {
			request.input(key, value)
		})

		const result = await request.query<T>(sql)
		return result.recordset || []
	}

	async savepoint(name: string) {
		try {
			const request = new Request(this.transaction)
			await request.query(`SAVE TRANSACTION ${name}`)
			return true
		} catch {
			return false
		}
	}

	/**
	 * SQL Server does not support explicit release of savepoints (RELEASE SAVEPOINT) as PostgreSQL does.
	 * In SQL Server, savepoints are automatically released when the transaction is committed or rolled back,
	 * whereas PostgreSQL allows manual release of savepoints using the RELEASE SAVEPOINT command.
	 * This method is a no-op for SQL Server and always returns true.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async releaseSavepoint(name: string) {
		// SQL Server doesn't have RELEASE SAVEPOINT like PostgreSQL
		// Savepoints are automatically released when the transaction commits or rolls back
		return true
	}

	async commit() {
		await this.transaction.commit()
	}

	async rollback(savepoint?: string) {
		if (savepoint) {
			const request = new Request(this.transaction)
			await request.query(`ROLLBACK TRANSACTION ${savepoint}`)
			return
		}

		await this.transaction.rollback()
	}
}

class PoolSingleton {
	private static pool?: ConnectionPoolType

	static async getPool(connectionString: string, {
		minPoolSize = DB.MIN_POOL_SIZE,
		maxPoolSize = DB.MAX_POOL_SIZE,
		maxIdleTime = DB.MAX_IDLE_TIME
	} = {}) {
		if (PoolSingleton.pool && PoolSingleton.pool.connected) {
			return PoolSingleton.pool
		}

		const url = new URL(connectionString)
		const config = {
			server: url.hostname,
			port: parseInt(url.port) || 1433,
			user: url.username,
			password: url.password,
			database: url.pathname.slice(1) || 'master',
			pool: {
				min: minPoolSize,
				max: maxPoolSize,
				idleTimeoutMillis: maxIdleTime,
			},
			options: {
				// encrypt: false, // Encryption is disabled for development environments. Remove or set to true for production.
				trustServerCertificate: true,
				enableArithAbort: true,
				validateParameters: false,
				// trustedConnection: true,
			},
			// driver: 'msnodesqlv8'
		}

		await waitForDatabase(async () => {
			const testConnection = new ConnectionPool({
				...config,
				pool: undefined
			})

			try {
				await testConnection.connect()
				const request = new Request(testConnection)
				await request.query('SELECT 1')
			} finally {
				await testConnection.close()
			}
		})

		PoolSingleton.pool = new ConnectionPool(config)
		await PoolSingleton.pool.connect()
		
		return PoolSingleton.pool
	}

	static async disconnect() {
		if (PoolSingleton.pool && PoolSingleton.pool.connected) {
			await PoolSingleton.pool.close()
		}

		PoolSingleton.pool = undefined
	}
}