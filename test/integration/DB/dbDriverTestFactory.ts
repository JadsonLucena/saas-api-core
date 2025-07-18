import assert from 'node:assert'
import crypto from 'node:crypto'

import { type ISqlDriver, TRANSACTION_ISOLATION_LEVELS } from '../../../src/application/ports/ISqlDriver.ts'

export function dbDriverTestFactory(driver: ISqlDriver, databaseName: string = '') {
  const tableName = databaseName ? `${databaseName}.users` : 'users'

  async function setup() {
  }

  async function teardown() {
    await driver.disconnect()
  }

  return {
    setup,
    teardown,
    executeSimpleQuery: async () => {
      const result = await driver.query(`SELECT * FROM ${tableName}`)
      assert(Array.isArray(result))
      assert(result.length > 0)
    },
    handleEmptyResultSets: async () => {
      const result = await driver.query(`SELECT * FROM ${tableName} WHERE name = 'xpto'`)

      assert(Array.isArray(result))
      assert(result.length === 0)
    },
    throwErrorForInvalidSQL: async () => {
      await assert.rejects(() => driver.query(`SELECT * FROM non_existing_table`))
    },
    commitTransaction: async () => {
      const params = {
        id: crypto.randomUUID(),
        name: 'Commit Transaction'
      }

      const transaction = await driver.beginTransaction()
      await transaction.query(`INSERT INTO ${tableName} (id, name) VALUES ('${params.id}', '${params.name}')`)
      await transaction.commit()

      const selectResult = await driver.query(`SELECT * FROM ${tableName} WHERE id = '${params.id}'`)

      assert.ok(Array.isArray(selectResult))
      assert.ok(selectResult.length === 1)
      assert.ok(selectResult[0].id === params.id)
    },
    rollbackTransaction: async () => {
      const params = {
        id: crypto.randomUUID(),
        name: 'Rollback Transaction'
      }

      const transaction = await driver.beginTransaction()
      await transaction.query(`INSERT INTO ${tableName} (id, name) VALUES ('${params.id}', '${params.name}')`)
      await transaction.rollback()

      const selectResult = await driver.query(`SELECT * FROM ${tableName} WHERE id = '${params.id}'`)
      assert.deepStrictEqual(selectResult, [])
    },
    createAndRollbackToSavepoint: async () => {
      const params1 = {
        id: crypto.randomUUID(),
        name: 'Rollback Savepoint Test 1'
      }

      const transaction = await driver.beginTransaction()
      await transaction.query(`INSERT INTO ${tableName} (id, name) VALUES ('${params1.id}', '${params1.name}')`)

      const savepointName = 'test_savepoint'
      await transaction.savepoint(savepointName)

      const params2 = {
        id: crypto.randomUUID(),
        name: 'Rollback Savepoint Test 2'
      }
      await transaction.query(`INSERT INTO ${tableName} (id, name) VALUES ('${params2.id}', '${params2.name}')`)
      await transaction.rollback(savepointName)
      await transaction.commit()

      const result1 = await driver.query(`SELECT * FROM ${tableName} WHERE id = '${params1.id}'`)
      const result2 = await driver.query(`SELECT * FROM ${tableName} WHERE id = '${params2.id}'`)

      assert.ok(Array.isArray(result1))
      assert.ok(result1.length === 1)
      assert.ok(result1[0].id === params1.id)
      assert.deepStrictEqual(result2, [])
    },
    throwErrorWhenUsingReleasedSavepoint: async () => {
      const transaction = await driver.beginTransaction()
      const savepointName = 'test_savepoint'

      await transaction.savepoint(savepointName)
      await transaction.releaseSavepoint(savepointName)

      await assert.rejects(() => transaction.rollback(savepointName))

      await transaction.rollback()
    },
    throwErrorWhenUsingReleasedTransaction: async () => {
      const transaction = await driver.beginTransaction()
      await transaction.commit()

      await assert.rejects(() => transaction.rollback())
    },
    testReadUncommittedIsolation: async () => {
      const transaction1 = await driver.beginTransaction(TRANSACTION_ISOLATION_LEVELS.READ_UNCOMMITTED)
      const transaction2 = await driver.beginTransaction(TRANSACTION_ISOLATION_LEVELS.READ_UNCOMMITTED)

      await transaction1.query(`INSERT INTO ${tableName} (name) VALUES ('${TRANSACTION_ISOLATION_LEVELS.READ_UNCOMMITTED}')`)

      const resultBeforeRollback = await transaction2.query(`SELECT * FROM ${tableName} WHERE name = '${TRANSACTION_ISOLATION_LEVELS.READ_UNCOMMITTED}'`)

      await transaction1.rollback()

      const resultAfterRollback = await transaction2.query(`SELECT * FROM ${tableName} WHERE name = '${TRANSACTION_ISOLATION_LEVELS.READ_UNCOMMITTED}'`)

      // Can read data that can be reversed. Dirty read
      assert.strictEqual(resultBeforeRollback.length, 1)
      assert.strictEqual(resultAfterRollback.length, 0)

      await transaction2.rollback()
    },
    testReadCommittedIsolation: async () => {
      const transaction1 = await driver.beginTransaction(TRANSACTION_ISOLATION_LEVELS.READ_COMMITTED)
      const transaction2 = await driver.beginTransaction(TRANSACTION_ISOLATION_LEVELS.READ_COMMITTED)

      await transaction1.query(`INSERT INTO ${tableName} (name) VALUES ('${TRANSACTION_ISOLATION_LEVELS.READ_COMMITTED}')`)

      const resultBeforeCommit = await transaction2.query(`SELECT * FROM ${tableName} WHERE name = '${TRANSACTION_ISOLATION_LEVELS.READ_COMMITTED}'`)
      
      await transaction1.commit()

      const resultAfterCommit = await transaction2.query(`SELECT * FROM ${tableName} WHERE name = '${TRANSACTION_ISOLATION_LEVELS.READ_COMMITTED}'`)

      // Allows reading only data that has already been confirmed by other transactions.
      assert.strictEqual(resultBeforeCommit.length, 0)
      assert.strictEqual(resultAfterCommit.length, 1)

      await transaction2.rollback()
    },
    testRepeatableReadIsolation: async () => {
      const insertQuery = `INSERT INTO ${tableName} (name) VALUES ('${TRANSACTION_ISOLATION_LEVELS.REPEATABLE_READ}')`
      const selectQuery = `SELECT * FROM ${tableName} WHERE name = '${TRANSACTION_ISOLATION_LEVELS.REPEATABLE_READ}'`

      await driver.query(insertQuery)

      const transaction1 = await driver.beginTransaction(TRANSACTION_ISOLATION_LEVELS.REPEATABLE_READ)
      const firstRead = await transaction1.query(selectQuery)

      const transaction2 = await driver.beginTransaction()
      await transaction2.query(insertQuery)
      await transaction2.commit()

      const secondRead = await transaction1.query(selectQuery)
      await transaction1.commit()

      const thirdReading = await driver.query(selectQuery)

      assert.strictEqual(firstRead.length, 1)
      assert.strictEqual(secondRead.length, 1)
      assert.strictEqual(thirdReading.length, 2)
    },
    testSerializableIsolation: async () => {
      const transaction1 = await driver.beginTransaction(TRANSACTION_ISOLATION_LEVELS.SERIALIZABLE)
      const transaction2 = await driver.beginTransaction()

      await transaction1.query(`INSERT INTO ${tableName} (name) VALUES ('${TRANSACTION_ISOLATION_LEVELS.SERIALIZABLE}')`)

      // Ensures that transactions occur as if they were executed serially, one at a time
      const error = new Error('Transaction timeout')
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(error), 1_000)
      })

      await assert.rejects(() => Promise.all([
        timeoutPromise,
        transaction2.query(`SELECT COUNT(*) as count FROM ${tableName} WHERE name LIKE '%${TRANSACTION_ISOLATION_LEVELS.SERIALIZABLE}%'`)
      ]), error)

      await transaction2.rollback()
      await transaction1.commit()
    }
  }
}
