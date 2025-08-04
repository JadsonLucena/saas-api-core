import { after, describe, it } from 'node:test'
import assert from 'node:assert'
import crypto from 'node:crypto'

import { DB } from '../../../src/config.ts'
import GatewayFactory from '../../../src/infrastructure/services/GatewayFactory.ts'
import { dbDriverTestFactory } from './dbDriverTestFactory.ts'
import { TRANSACTION_ISOLATION_LEVELS } from '../../../src/application/ports/ISqlDriver.ts'

const driver = await GatewayFactory.sqlDriver({
	connectionString: 'mssql://SA:StrongPass1!@localhost:1433/test',
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
			INSERT INTO ${tableName} (name, age, isValid, amount, birthdate, data)
			VALUES (@name, @age, @isValid, @amount, @birthdate, @data)
		`

		await driver.query(sql, params)

		const result = await driver.query(`SELECT * FROM ${tableName} WHERE name = @name`, {
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
	// it('should throw an error when using a released savepoint', tests.throwErrorWhenUsingReleasedSavepoint)
	it('should throw an error when using a released transaction', tests.throwErrorWhenUsingReleasedTransaction)
})

describe('Transaction Isolation Levels', () => {
	it('should handle READ UNCOMMITTED isolation level', tests.testReadUncommittedIsolation)
	it('should handle READ COMMITTED isolation level', async () => {
		const params = {
			id: crypto.randomUUID(),
			name: TRANSACTION_ISOLATION_LEVELS.READ_COMMITTED
		}

		const transaction1 = await driver.beginTransaction()

		await transaction1.query(`INSERT INTO ${tableName} (id, name) VALUES (@id, @name)`, params)

		const error = new Error('Transaction timeout')
		const timeoutPromise = new Promise((_, reject) => {
			setTimeout(() => reject(error), 1_000)
		})

		await assert.rejects(() => Promise.all([
			timeoutPromise,
			driver.query(`SELECT * FROM ${tableName} WHERE id = @id`, {
				id: params.id
			})
		]), error)

		await transaction1.commit()

		const resultAfterCommit = await driver.query(`SELECT * FROM ${tableName} WHERE id = @id`, {
			id: params.id
		})

		assert.strictEqual(resultAfterCommit.length, 1)
	})
	it('should handle REPEATABLE READ isolation level', async () => {
		const params = {
			id: crypto.randomUUID(),
			name: TRANSACTION_ISOLATION_LEVELS.REPEATABLE_READ
		}

		const selectQuery = `SELECT * FROM ${tableName} WHERE name LIKE @name`

		await driver.query(`INSERT INTO ${tableName} (id, name) VALUES (@id, @name)`, params)

		const transaction = await driver.beginTransaction(TRANSACTION_ISOLATION_LEVELS.REPEATABLE_READ)
		const firstReading = await transaction.query(selectQuery, {
			name: `%${params.name}%`
		})

		const error = new Error('Transaction timeout')
		const timeoutPromise = new Promise((_, reject) => {
			setTimeout(() => reject(error), 1_000)
		})

		await assert.rejects(() => Promise.race([
			timeoutPromise,
			driver.query(`UPDATE ${tableName} set name = @name WHERE id = @id`, {
				id: params.id,
				name: `NEW_${params.name}`
			})
		]), error)

		await driver.query(`INSERT INTO ${tableName} (name) VALUES (@name)`, {
			name: `NEW1_${params.name}`
		})

		const secondReading = await transaction.query(selectQuery, {
			name: `%${params.name}%`
		})

		await transaction.commit()

		const thirdReading = await driver.query(selectQuery, {
			name: `%${params.name}%`
		})

		assert.strictEqual(firstReading.length, 1)
		assert.strictEqual(secondReading.length, 2, 'phantom read allowed in SQL Server')
		assert.strictEqual(thirdReading.length, 2)
	})
	it('should handle SERIALIZABLE isolation level', tests.testSerializableIsolation)
})
