import { after, describe, it } from 'node:test'
import assert from 'node:assert'

import { DB } from '../../../src/config.ts'
import GatewayFactory from '../../../src/infrastructure/services/GatewayFactory.ts'
import { dbDriverTestFactory } from './dbDriverTestFactory.ts'
import { TRANSACTION_ISOLATION_LEVELS } from '../../../src/application/ports/ISqlDriver.ts'

const driver = await GatewayFactory.sqlDriver({
	connectionString: 'postgresql://postgres:StrongPass1!@localhost:5432/test',
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
			name: 'Test User',
			age: 30,
			isValid: true,
			amount: BigInt(2003764205206896640),
			birthdate: new Date(),
			data: Buffer.from('test data')
		}
		const sql = `
			INSERT INTO users (name, age, isValid, amount, birthdate, data)
			VALUES ($1, $2, $3, $4, $5, $6)
		`

		await driver.query(sql, params)

		const result = await driver.query(`SELECT * FROM users WHERE name = $1`, {
			name: params.name
		})

		assert(Array.isArray(result))
		assert(result.length === 1)
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
	// In PostgreSQL, the READ UNCOMMITTED transaction isolation level is treated as READ COMMITTED
	// it('should handle READ UNCOMMITTED isolation level', tests.testReadUncommittedIsolation)
	it('should handle READ COMMITTED isolation level', tests.testReadCommittedIsolation)
	it('should handle REPEATABLE READ isolation level', tests.testRepeatableReadIsolation)
	it('should handle SERIALIZABLE isolation level', async () => {
		const params = {
			name: TRANSACTION_ISOLATION_LEVELS.SERIALIZABLE,
			age: 10
		}

		const transaction = await driver.beginTransaction(TRANSACTION_ISOLATION_LEVELS.SERIALIZABLE)

		const selectQuery = `SELECT * FROM ${tableName} WHERE age >= $1`

		const firstReading = await transaction.query(selectQuery, {
			age: params.age
		})

		await driver.query(`INSERT INTO ${tableName} (name, age) VALUES ($1, $2)`, {
			name: params.name,
			age: params.age
		})

		const secondReading = await transaction.query(selectQuery, {
			age: params.age
		})

		await transaction.commit()

		assert.strictEqual(firstReading.length, secondReading.length)
	})
})