import { DB } from '../../../../../config.ts'

import { type ISqlDriver, type ITransactionDriver, type Result, type Params, TRANSACTION_ISOLATION_LEVELS } from '../../../../../application/ports/ISqlDriver.ts'
import { waitForDatabase } from '../waitForDatabase.ts'

import mysqlx, { type Scalar } from '@mysql/xdevapi'
import { createPool, Pool } from 'generic-pool'

export default class MySqlDriver implements ISqlDriver {
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

	async query<T extends Result = Record<string, Scalar>>(
		sql: string,
		params: Params = {}
	) {
		const pool = await PoolSingleton.getPool(this.connectionString, this.poolOptions)
		const session = await pool.acquire()

		try {
			const result = await session.sql(sql).bind(Object.values(params)).execute()

			return mapToJSON<T>(result)
		} finally {
			await pool.release(session)
		}
	}

	async beginTransaction(isolationLevel = TRANSACTION_ISOLATION_LEVELS.READ_COMMITTED): Promise<ITransactionDriver> {
		const pool = await PoolSingleton.getPool(this.connectionString, this.poolOptions)
		const transaction = await pool.acquire()

		await transaction.sql(`SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`).execute()
		await transaction.startTransaction()

		return new MySqlTransactionDriver(pool, transaction)
	}

	async disconnect() {
		await PoolSingleton.disconnect()
	}
}

class MySqlTransactionDriver implements ITransactionDriver {
	private readonly pool: Pool<mysqlx.Session>
	private readonly transaction: mysqlx.Session

	constructor(
		pool: Pool<mysqlx.Session>,
		transaction: mysqlx.Session
	) {
		this.pool = pool
		this.transaction = transaction
	}

	async query<T extends Result = Record<string, Scalar>>(
		sql: string,
		params: Params = {}
	) {
		const result = await this.transaction.sql(sql).bind(Object.values(params)).execute()

		return mapToJSON<T>(result)
	}

	async savepoint(name: string) {
		return await this.transaction.setSavepoint(name)
			.then(() => true)
			.catch(() => false)
	}

	async releaseSavepoint(name: string) {
		return await this.transaction.releaseSavepoint(name)
			.then(() => true)
			.catch(() => false)
	}

	async commit() {
		await this.transaction.commit()
		await this.pool.release(this.transaction)
	}

	async rollback(savepoint?: string) {
		if (savepoint) {
			await this.transaction.rollbackTo(savepoint)
			return
		}

		await this.transaction.rollback()
		await this.pool.release(this.transaction)
	}
}

class PoolSingleton {
	private static pool?: Promise<Pool<mysqlx.Session>>

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
	}): Promise<Pool<mysqlx.Session>> {
		const pool = createPool({
			create: () => mysqlx.getSession(connectionString),
			destroy: session => session.close(),
		}, {
			min: options.minPoolSize,
			max: options.maxPoolSize,
			idleTimeoutMillis: options.maxIdleTime,
			autostart: true
		})

		await waitForDatabase(() => pool.acquire().then(session => pool.release(session)))

		return pool
	}

	static async disconnect() {
		const pool = await PoolSingleton.pool

		if (pool) {
			await pool.drain()
			await pool.clear()
			PoolSingleton.pool = undefined
		}
	}
}

function mapToJSON<T extends Result>(result: mysqlx.SqlResult) {
	return result.fetchAll().map<T>(row => result.getColumns().reduce((acc, col, i) => {
		// @ts-expect-error: TypeScript cannot infer the type of dynamic object keys here
		// eslint-disable-next-line security/detect-object-injection
		acc[col.getColumnLabel()] = row[i]

		return acc
	}, {} as T))
}