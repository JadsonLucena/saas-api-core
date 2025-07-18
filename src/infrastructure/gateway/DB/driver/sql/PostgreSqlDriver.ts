import { DB } from '../../../../../config.ts'

import { type ISqlDriver, type ITransactionDriver, type Result, type Params, TRANSACTION_ISOLATION_LEVELS } from '../../../../../application/ports/ISqlDriver.ts'
import { waitForDatabase } from '../waitForDatabase.ts'

import { Client } from 'pg'
import { createPool, Pool } from 'generic-pool'

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
		const session = await pool.acquire()

		try {
			const result = await session.query<T>(sql, Object.values(params))

			return result.rows
		} finally {
			await pool.release(session)
		}
	}

	async beginTransaction(isolationLevel: Omit<TRANSACTION_ISOLATION_LEVELS, 'READ_UNCOMMITTED'> = TRANSACTION_ISOLATION_LEVELS.READ_COMMITTED): Promise<ITransactionDriver> {
		const pool = await PoolSingleton.getPool(this.connectionString, this.poolOptions)
		const transaction = await pool.acquire()

		// eslint-disable-next-line sonarjs/sql-queries
		await transaction.query(`BEGIN TRANSACTION ISOLATION LEVEL ${isolationLevel}`)

		return new PostgreSqlTransactionDriver(pool, transaction)
	}

	async disconnect() {
		await PoolSingleton.disconnect()
	}
}

class PostgreSqlTransactionDriver implements ITransactionDriver {
	private readonly pool: Pool<Client>
	private readonly transaction: Client

	constructor(
		pool: Pool<Client>,
		transaction: Client
	) {
		this.pool = pool
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
		await this.pool.release(this.transaction)
	}

	async rollback(savepoint?: string) {
		if (savepoint) {
			// eslint-disable-next-line sonarjs/sql-queries
			await this.transaction.query(`ROLLBACK TO SAVEPOINT ${savepoint}`)
			return
		}

		await this.transaction.query('ROLLBACK')
		await this.pool.release(this.transaction)
	}
}

class PoolSingleton {
	private static pool?: Pool<Client>

	static async getPool(connectionString: string, {
		minPoolSize = DB.MIN_POOL_SIZE,
		maxPoolSize = DB.MAX_POOL_SIZE,
		maxIdleTime = DB.MAX_IDLE_TIME
	} = {}) {
		if (PoolSingleton.pool) {
			return PoolSingleton.pool
		}

		try {
			await waitForDatabase(async () => {
				const testClient = new Client({ connectionString })
				try {
					await testClient.connect()
					await testClient.query('SELECT 1')
				} finally {
					await testClient.end()
				}
			})

			PoolSingleton.pool = createPool({
				create: async () => {
					const client = new Client({ connectionString })
					await client.connect()
					return client
				},
				destroy: client => client.end()
			}, {
				min: minPoolSize,
				max: maxPoolSize,
				idleTimeoutMillis: maxIdleTime
			})

			PoolSingleton.pool.start()
			await PoolSingleton.pool.ready()

			return PoolSingleton.pool
		} catch (err) {
			await this.disconnect()
			throw err
		}
	}

	static async disconnect() {
		await PoolSingleton.pool?.drain()
		await PoolSingleton.pool?.clear()
		PoolSingleton.pool = undefined
	}
}