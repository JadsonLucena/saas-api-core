import { after, describe, it } from 'node:test'
import assert from 'node:assert'
import crypto from 'node:crypto'

import { DB } from '../../../src/config.ts'
import GatewayFactory from '../../../src/infrastructure/services/GatewayFactory.ts'
import { dbDriverTestFactory } from './dbDriverTestFactory.ts'

const driver = await GatewayFactory.sqlDriver({
	connectionString: 'mysqlx://root:StrongPass1!@localhost:33060/test',
	maxPoolSize: DB.MAX_POOL_SIZE,
	minPoolSize: DB.MIN_POOL_SIZE,
	maxIdleTime: DB.MAX_IDLE_TIME
})

const tableName = 'users'

const tests = dbDriverTestFactory(driver, tableName)

after(() => driver.disconnect())

describe('Query', () => {
	it('should execute a simple query', tests.executeSimpleQuery)
	it('should handle empty result sets', tests.handleEmptyResultSets)
	it('should throw an error for invalid SQL', tests.throwErrorForInvalidSQL)
	it('should execute a query with parameters', async () => {
		const params = {
			id: crypto.randomUUID(),
			name: 'Test User',
			age: 30,
			is_valid: true,
			amount: BigInt(Number.MAX_SAFE_INTEGER + 1),
			birthdate: new Date(),
			data: Buffer.from('test data')
		}
		const sql = `
			INSERT INTO users (id, name, age, is_valid, amount, birthdate, data)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`

		await driver.query(sql, params)

		const result = await driver.query<{
			id: string,
			name: string,
			age: number,
			isValid: number, // BOOLEAN is an alias for TINYINT(1)
			amount: string,  // MySQL returns bigint as string
			birthdate: Date, // Use DATETIME(3) to maintain millisecond precision
			data: Buffer
		}>(`SELECT id, name, age, is_valid as isValid, amount, birthdate, data FROM users WHERE id = ?`, {
			id: params.id
		})

		assert.ok(Array.isArray(result))
		assert.ok(result.length === 1)
		assert.strictEqual(result[0].name, params.name)
		assert.strictEqual(result[0].age, params.age)
		assert.strictEqual(Boolean(result[0].isValid), params.is_valid)
		assert.strictEqual(BigInt(result[0].amount), params.amount)
		assert.strictEqual(result[0].birthdate.toISOString(), params.birthdate.toISOString())
		assert.strictEqual(result[0].data.toString(), params.data.toString())
	})
})

describe('TransactionDriver', () => {
	it('should commit a transaction', tests.commitTransaction)
	it('should rollback a transaction', tests.rollbackTransaction)
	it('should create and rollback to a savepoint', tests.createAndRollbackToSavepoint)
	it('should throw an error when using a released savepoint', tests.throwErrorWhenUsingReleasedSavepoint)
	it('should throw an error when using a released transaction', tests.throwErrorWhenUsingReleasedTransaction)
})

describe('Transaction Isolation Levels', () => {
	it('should handle READ UNCOMMITTED isolation level', tests.testReadUncommittedIsolation)
	it('should handle READ COMMITTED isolation level', tests.testReadCommittedIsolation)
	it('should handle REPEATABLE READ isolation level', tests.testRepeatableReadIsolation)
	it('should handle SERIALIZABLE isolation level', tests.testSerializableIsolation)
})