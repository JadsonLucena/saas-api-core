import { before, after, describe, it } from 'node:test'
import assert from 'node:assert'

import MySqlDriver from '../../../src/infrastructure/gateway/DB/driver/sql/MySqlDriver.ts'

const connectionString = 'mysqlx://root:@localhost:33060'
const driver = new MySqlDriver(connectionString)

const DATABASE = 'mysql_test'
const TABLE = 'users'
const ROWS = [
	{
		id: '56d9cd63-e934-4734-bb54-edba98ce827e',
		name: 'John Doe'
	},
	{
		id: '6400e105-c98c-4dc2-a711-d9a4df99a5aa',
		name: 'Jane Doe'
	}
]

before(async () => {
	await driver.query(`CREATE DATABASE IF NOT EXISTS ${DATABASE}`)
	await driver.query(`DROP TABLE IF EXISTS ${DATABASE}.${TABLE};`)
	await driver.query(`
		CREATE TABLE IF NOT EXISTS ${DATABASE}.${TABLE} (
			id VARCHAR(255) PRIMARY KEY NOT NULL,
			name VARCHAR(255) NOT NULL
		)
	`)
	await driver.query(`
		REPLACE INTO ${DATABASE}.${TABLE} (id, name) VALUES
		('${ROWS[0].id}', '${ROWS[0].name}'),
		('${ROWS[1].id}', '${ROWS[1].name}')
	`)
})
after(async () => {
	await driver.disconnect()
})

describe('Query', () => {
    it('should execute a simple query', async () => {
			const result = await driver.query(`SELECT * FROM ${DATABASE}.${TABLE}`)
			assert(Array.isArray(result))
			assert(result.length > 0)
    })

    it('should execute a query with parameters', async () => {
			const result = await driver.query(`SELECT * FROM ${DATABASE}.${TABLE} WHERE id = ?`, {
				id: ROWS[0].id
			})

			assert(Array.isArray(result))
			assert(result.length === 1)
			assert.deepStrictEqual(result[0], ROWS[0])
    })

    it('should handle empty result sets', async () => {
			const result = await driver.query(`SELECT * FROM ${DATABASE}.${TABLE} WHERE id = ?`, {
				id: 'xpto'
			})

			assert(Array.isArray(result))
			assert(result.length === 0)
    })

    it('should throw an error for invalid SQL', () => {
			assert.rejects(() => driver.query(`SELECT * FROM non_existing_table`))
    })
})

describe('TransactionDriver', async () => {
	it('should commit a transaction', async () => {
		const sql = `INSERT INTO ${DATABASE}.${TABLE} (id, name) VALUES (?, ?)`
		const params = {
			id: '2abe4090-c041-43ed-8d6b-49dc61ecb6d7',
			name: 'Bob'
		}

		const transaction = await driver.beginTransaction()
		await transaction.query(sql, params)
		await transaction.commit()

		const selectResult = await driver.query(`SELECT * FROM ${DATABASE}.${TABLE} WHERE id = ?`, {
			id: params.id
		})
		assert.deepStrictEqual(selectResult, [params])
	})

	it('should rollback a transaction', async () => {
		const sql = `INSERT INTO ${DATABASE}.${TABLE} (id, name) VALUES (?, ?)`
		const params = {
			id: '4ce500f4-e157-4f62-ac18-7ea8f7a02516',
			name: 'Charlie'
		}

		const transaction = await driver.beginTransaction()
		await transaction.query(sql, params)
		await transaction.rollback()

		const selectResult = await driver.query(`SELECT * FROM ${DATABASE}.${TABLE} WHERE id = ?`, {
			id: params.id
		})
		assert.deepStrictEqual(selectResult, [])
	})

	it('should create and rollback to a savepoint', async () => {
		const sql = `INSERT INTO ${DATABASE}.${TABLE} (id, name) VALUES (?, ?)`
		const params1 = {
			id: '5867a280-c12a-45cd-977b-47c81834a535',
			name: 'Test1'
		}

		const transaction = await driver.beginTransaction()
		await transaction.query(sql, params1)

		const savepointName = 'test_savepoint'
		await transaction.savepoint(savepointName)

		const params2 = {
			id: '5bba447e-20eb-4baa-8008-8bd96f1a433f',
			name: 'Test2'
		}
		await transaction.query(sql, params2)
		await transaction.rollback(savepointName)
		await transaction.commit()

		const result1 = await driver.query(`SELECT * FROM ${DATABASE}.${TABLE} WHERE id = ?`, {
			id: params1.id
		})
		const result2 = await driver.query(`SELECT * FROM ${DATABASE}.${TABLE} WHERE id = ?`, {
			id: params2.id
		})
		assert.deepStrictEqual(result1, [params1])
		assert.deepStrictEqual(result2, [])
	})

	it('should throw an error when using a released savepoint', async () => {
		const transaction = await driver.beginTransaction()
		const savepointName = 'test_savepoint'

		await transaction.savepoint(savepointName)
		await transaction.releaseSavepoint(savepointName)

		assert.rejects(() => transaction.rollback(savepointName))
	})

	it('should throw an error when using a released transaction', async () => {
		const transaction = await driver.beginTransaction()
		await transaction.commit()

		assert.rejects(() => transaction.rollback())
	})
})