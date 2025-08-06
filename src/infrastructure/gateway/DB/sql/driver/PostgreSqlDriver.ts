import { DB } from '../../../../../config.ts'

import { type ISqlDriver, type ITransactionDriver, type Result, type Params, TRANSACTION_ISOLATION_LEVELS } from '../../../../../application/ports/ISqlDriver.ts'
import { waitForDatabase } from '../../waitForDatabase.ts'

import { Pool, type PoolClient } from 'pg'

export default class PostgreSqlDriver implements ISqlDriver {
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
		const session = await pool.connect()

		try {
			const result = await session.query<T>(sql, Object.values(params))

			return result.rows
		} finally {
			session.release()
		}
	}

	/**
	 * @remarks
	 * - **PostgreSQL does not support `READ UNCOMMITTED`**.
	 *   If selected, it will be silently treated as `READ COMMITTED`.
	 *
	 * - **SERIALIZABLE behaves differently across databases**:
	 *   - In **PostgreSQL**, it uses *Serializable Snapshot Isolation (SSI)*, allowing high concurrency.
	 *     Instead of blocking, it may throw a `serialization_failure` error on conflict, requiring a retry.
	 *   - In **MySQL** and **SQL Server**, it uses *pessimistic locking*, blocking concurrent transactions that modify the same data.
	 *
	 * Make sure your application handles retries appropriately when using SERIALIZABLE with PostgreSQL.
	 */
	async beginTransaction(isolationLevel: Omit<TRANSACTION_ISOLATION_LEVELS, 'READ_UNCOMMITTED'> = TRANSACTION_ISOLATION_LEVELS.READ_COMMITTED): Promise<ITransactionDriver> {
		const pool = await PoolSingleton.getPool(this.connectionString, this.poolOptions)
		const transaction = await pool.connect()

		// eslint-disable-next-line sonarjs/sql-queries
		await transaction.query(`BEGIN TRANSACTION ISOLATION LEVEL ${isolationLevel}`)

		return new PostgreSqlTransactionDriver(transaction)
	}

	async disconnect() {
		await PoolSingleton.disconnect()
	}
}

class PostgreSqlTransactionDriver implements ITransactionDriver {
	private readonly transaction: PoolClient

	constructor(transaction: PoolClient) {
		this.transaction = transaction
	}

	async query<T extends Result = Record<string, Buffer | Date | bigint | boolean | null | number | string>>(
		sql: string,
		params: Params = {}
	) {
		const result = await this.transaction.query<T>(sql, Object.values(params))

		return result.rows
	}

	async savepoint(name: string) {
		// eslint-disable-next-line sonarjs/sql-queries
		return await this.transaction.query(`SAVEPOINT ${name}`)
			.then(() => true)
			.catch(() => false)
	}

	async releaseSavepoint(name: string) {
		// eslint-disable-next-line sonarjs/sql-queries
		return await this.transaction.query(`RELEASE SAVEPOINT ${name}`)
			.then(() => true)
			.catch(() => false)
	}

	async commit() {
		await this.transaction.query('COMMIT')
		this.transaction.release()
	}

	async rollback(savepoint?: string) {
		if (savepoint) {
			// eslint-disable-next-line sonarjs/sql-queries
			await this.transaction.query(`ROLLBACK TO SAVEPOINT ${savepoint}`)
			return
		}

		await this.transaction.query('ROLLBACK')
		this.transaction.release()
	}
}

class PoolSingleton {
	private static pool?: Promise<Pool>

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
	}): Promise<Pool> {
		const pool = new Pool({
			connectionString,
			min: options.minPoolSize,
			max: options.maxPoolSize,
			idleTimeoutMillis: options.maxIdleTime
		})

		await waitForDatabase(() => pool.connect().then(client => client.release()))

		return pool
	}

	static async disconnect() {
		const pool = await PoolSingleton.pool

		if (pool && !pool.ended) {
			await pool.end()
			PoolSingleton.pool = undefined
		}
	}
}