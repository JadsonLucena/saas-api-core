import { DB } from '../../../../../config.ts'

import { type ISqlDriver, type ITransactionDriver, type Result, type Params, TRANSACTION_ISOLATION_LEVELS } from '../../../../../application/ports/ISqlDriver.ts'
import { waitForDatabase } from '../../waitForDatabase.ts'

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

	/**
	 * @remarks
	 * - **READ COMMITTED**:
	 *   - SQL Server: Uses pessimistic locking, which may block readers and writers.
	 *   - PostgreSQL/MySQL: Use MVCC, allowing non-blocking reads (snapshot-based).
	 *
	 * - **REPEATABLE READ**:
	 *   - SQL Server: Locks read rows (S-lock), preventing concurrent modifications.
	 *   - PostgreSQL/MySQL: Use MVCC to ensure repeatable reads without direct locking.
	 */
	async beginTransaction(isolationLevel: TRANSACTION_ISOLATION_LEVELS = TRANSACTION_ISOLATION_LEVELS.READ_COMMITTED): Promise<ITransactionDriver> {
		const pool = await PoolSingleton.getPool(this.connectionString, this.poolOptions)
		const transaction = new Transaction(pool)

		const isolationLevelMap = {
			[TRANSACTION_ISOLATION_LEVELS.READ_UNCOMMITTED]: ISOLATION_LEVEL.READ_UNCOMMITTED,
			[TRANSACTION_ISOLATION_LEVELS.READ_COMMITTED]: ISOLATION_LEVEL.READ_COMMITTED,
			[TRANSACTION_ISOLATION_LEVELS.REPEATABLE_READ]: ISOLATION_LEVEL.REPEATABLE_READ,
			[TRANSACTION_ISOLATION_LEVELS.SERIALIZABLE]: ISOLATION_LEVEL.SERIALIZABLE
		}

		// eslint-disable-next-line security/detect-object-injection
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
	 * @remarks SQL Server does NOT support releasing savepoints. This operation will be ignored when using SQL Server.
	 */
	async releaseSavepoint(name: string) {
			console.warn(`RELEASE SAVEPOINT is not supported by SQL Server. Ignoring release of savepoint "${name}".`)
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
	private static pool?: Promise<ConnectionPoolType>

	static async getPool(connectionString: string, {
		minPoolSize = DB.MIN_POOL_SIZE,
		maxPoolSize = DB.MAX_POOL_SIZE,
		maxIdleTime = DB.MAX_IDLE_TIME
	} = {}) {
		try {
			if (!PoolSingleton.pool) {
				PoolSingleton.pool = PoolSingleton.createPool(connectionString, {
					minPoolSize,
					maxPoolSize,
					maxIdleTime
				})
			}

			return await PoolSingleton.pool
		} catch (err) {
			await PoolSingleton.disconnect()
			throw err
		}
	}

	private static async createPool(connectionString: string, options: {
		minPoolSize: number,
		maxPoolSize: number,
		maxIdleTime: number
	}): Promise<ConnectionPoolType> {
		const url = new URL(connectionString)
		const config = {
			server: url.hostname,
			port: parseInt(url.port) || 1433,
			user: url.username,
			password: url.password,
			database: url.pathname.slice(1) || 'master',
			pool: {
				min: options.minPoolSize,
				max: options.maxPoolSize,
				idleTimeoutMillis: options.maxIdleTime
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

		const pool = new ConnectionPool(config)

		await waitForDatabase(async () => {
			await pool.connect()
		})

		return pool
	}

	static async disconnect() {
		const pool = await PoolSingleton.pool

		if (pool && pool.connected) {
			await pool.close()
			PoolSingleton.pool = undefined
		}
	}
}