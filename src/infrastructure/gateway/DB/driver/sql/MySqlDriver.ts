import { DB } from '../../../../../config.ts'

import type { ISqlDriver, ITransactionDriver, TransactionIsolationLevel, Result, Params } from '../../../../../application/ports/ISqlDriver.ts'

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
		const pool = await PoolSingleton.connect(this.connectionString, this.poolOptions)
		const client = await pool.acquire()

		try {
			const result = await client.sql(sql).bind(Object.values(params)).execute()

			return mapToJSON<T>(result)
		} finally {
			await pool.release(client)
		}
	}

	async beginTransaction(isolationLevel: TransactionIsolationLevel = 'REPEATABLE READ'): Promise<ITransactionDriver> {
		const pool = await PoolSingleton.connect(this.connectionString, this.poolOptions)
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
		try {
			await this.transaction.releaseSavepoint(name)
			return true
		} catch (error) {
			console.error('Failed to release savepoint:', error)
			return false
		}
	}

	async commit() {
		try {
			await this.transaction.commit()
		} catch (error) {
			throw new Error('Failed to commit transaction: ' + error.message)
		} finally {
			await this.pool.release(this.transaction)
		}
	}

	async rollback(savepoint?: string) {
		try {
			if (savepoint) {
				await this.transaction.rollbackTo(savepoint)
			} else {
				await this.transaction.rollback()
				await this.pool.release(this.transaction)
			}
		} catch (error) {
			await this.pool.release(this.transaction)
			throw new Error('Failed to rollback transaction: ' + error.message)
		}
	}
}

class PoolSingleton {
	private static pool?: Pool<mysqlx.Session>
	private static client?: mysqlx.Client

	static async connect(connectionString: string, {
		minPoolSize = DB.MIN_POOL_SIZE,
		maxPoolSize = DB.MAX_POOL_SIZE,
		maxIdleTime = DB.MAX_IDLE_TIME
	} = {}) {
		if (PoolSingleton.pool) {
			return PoolSingleton.pool
		}

		try {
			const client = mysqlx.getClient(connectionString, {
				pooling: {
					enabled: true,
					maxIdleTime: maxIdleTime,
					maxSize: maxPoolSize
				}
			})

			PoolSingleton.client = client
			PoolSingleton.pool = createPool({
				create: () => client.getSession().catch(err => {
					console.error('Failed to create MySQL session:', err)
					throw err
				}),
				destroy: session => session.close()
			}, {
				min: minPoolSize,
				max: maxPoolSize,
				idleTimeoutMillis: maxIdleTime
			})

			PoolSingleton.pool.start()
			await PoolSingleton.pool.ready()

			return PoolSingleton.pool
		} catch (err) {
			this.disconnect()
			throw err
		}
	}

	static async disconnect() {
		await PoolSingleton.pool?.drain()
		await PoolSingleton.pool?.clear()
		PoolSingleton.pool = undefined

		await PoolSingleton.client?.close()
		PoolSingleton.client = undefined
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