import assert from 'node:assert'
import crypto from 'node:crypto'

import { type ISqlDriver, TRANSACTION_ISOLATION_LEVELS } from '../../../src/application/ports/ISqlDriver.ts'

// This is used to ensure consistency in UUID format across different database systems
// sql server uses uppercase UUIDs by default
function compareUUID(uuidA: string, uuidB: string) {
  return uuidA.toUpperCase() === uuidB.toUpperCase()
}

export function dbDriverTestFactory(driver: ISqlDriver, tableName: string) {
  return {
    compareUUID,
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

      const selectResult = await driver.query<{
        id: string
      }>(`SELECT * FROM ${tableName} WHERE id = '${params.id}'`)

      assert.ok(Array.isArray(selectResult))
      assert.ok(selectResult.length === 1)
      assert.ok(compareUUID(selectResult[0].id, params.id))
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

      const result1 = await driver.query<{
        id: string
      }>(`SELECT * FROM ${tableName} WHERE id = '${params1.id}'`)
      const result2 = await driver.query(`SELECT * FROM ${tableName} WHERE id = '${params2.id}'`)

      assert.ok(Array.isArray(result1))
      assert.ok(result1.length === 1)
      assert.ok(compareUUID(result1[0].id, params1.id))
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
      const params = {
        id: crypto.randomUUID(),
        name: TRANSACTION_ISOLATION_LEVELS.READ_UNCOMMITTED
      }

      const transaction1 = await driver.beginTransaction(TRANSACTION_ISOLATION_LEVELS.READ_UNCOMMITTED)
      const transaction2 = await driver.beginTransaction(TRANSACTION_ISOLATION_LEVELS.READ_UNCOMMITTED)

      await transaction1.query(`INSERT INTO ${tableName} (id, name) VALUES ('${params.id}', '${params.name}')`)

      const resultBeforeRollback = await transaction2.query(`SELECT * FROM ${tableName} WHERE id = '${params.id}'`)

      await transaction1.commit()

      const resultAfterRollback = await transaction2.query(`SELECT * FROM ${tableName} WHERE id = '${params.id}'`)

      // Dirty read
      assert.strictEqual(resultBeforeRollback.length, resultAfterRollback.length)

      await transaction2.rollback()
    },
    testReadCommittedIsolation: async () => {
      const params = {
        id: crypto.randomUUID(),
        name: TRANSACTION_ISOLATION_LEVELS.READ_COMMITTED
      }

      const transaction1 = await driver.beginTransaction()

      await transaction1.query(`INSERT INTO ${tableName} (id, name) VALUES ('${params.id}', '${params.name}')`)

      const resultBeforeCommit = await driver.query(`SELECT * FROM ${tableName} WHERE id = '${params.id}'`)

      await transaction1.commit()

      const resultAfterCommit = await driver.query(`SELECT * FROM ${tableName} WHERE id = '${params.id}'`)

      assert.strictEqual(resultBeforeCommit.length, 0)
      assert.strictEqual(resultAfterCommit.length, 1)
    },
    testRepeatableReadIsolation: async () => {
      const params = {
        name: TRANSACTION_ISOLATION_LEVELS.REPEATABLE_READ
      }
      const insertQuery = `INSERT INTO ${tableName} (name) VALUES ('${params.name}')`
      const selectQuery = `SELECT * FROM ${tableName} WHERE name = '${params.name}'`

      await driver.query(insertQuery)

      const transaction1 = await driver.beginTransaction(TRANSACTION_ISOLATION_LEVELS.REPEATABLE_READ)
      const firstReading = await transaction1.query(selectQuery)

      await driver.query(insertQuery)

      const secondReading = await transaction1.query(selectQuery)
      await transaction1.commit()

      const thirdReading = await driver.query(selectQuery)

      assert.strictEqual(firstReading.length, 1)
      assert.strictEqual(secondReading.length, 1)
      assert.strictEqual(thirdReading.length, 2)
    },
    testSerializableIsolation: async () => {
      const params = {
        name: TRANSACTION_ISOLATION_LEVELS.SERIALIZABLE,
        age: 10
      }

      const transaction = await driver.beginTransaction(TRANSACTION_ISOLATION_LEVELS.SERIALIZABLE)

      const selectQuery = `SELECT * FROM ${tableName} WHERE age >= ${params.age}`

      const firstReading = await transaction.query(selectQuery)

      // Ensures that transactions occur as if they were executed serially, one at a time
      const error = new Error('Transaction timeout')
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(error), 1_000)
      })

      await assert.rejects(() => Promise.race([
        timeoutPromise,
        driver.query(`INSERT INTO ${tableName} (name, age) VALUES ('${params.name}', ${params.age})`)
      ]), error)

      const secondReading = await transaction.query(selectQuery)

      await transaction.commit()
      
      assert.strictEqual(firstReading.length, secondReading.length)
    }
  }
}
