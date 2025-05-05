import test, { after, describe } from 'node:test'
import assert from 'node:assert'

import Redis from '../../../src/infrastructure/gateway/cacheDB/Redis.ts'

const redis = new Redis('redis://localhost:6379')

describe('Redis', () => {
	after(() => redis.disconnect());

	test('set and get', async () => {
		const key = 'test-key-exp'
		const value = 'test-value-exp'

		await redis.set(key, value, {
			expires: 1
		})
		const result = await redis.get(key)

		assert.strictEqual(result, value)
		await new Promise(resolve => setTimeout(resolve, 2000))

		const resultAfterExpiration = await redis.get(key)
		assert.strictEqual(resultAfterExpiration, null)
	})

	test('increment with fixed window', async () => {
		const key = 'test-key-inc'

		const incrementedValue1 = await redis.increment(key, {
			expires: 1
		})
		assert.strictEqual(incrementedValue1, 1)

		const incrementedValue2 = await redis.increment(key, {
			expires: 1
		})
		assert.strictEqual(incrementedValue2, 2)
	})

	test('increment with sliding window', async () => {
		const key = 'test-key-inc'

		const incrementedValue1 = await redis.increment(key, {
			expires: 1,
			slidingWindow: true
		})
		assert.strictEqual(incrementedValue1, 1)

		const incrementedValue2 = await redis.increment(key, {
			expires: 1,
			slidingWindow: true
		})
		assert.strictEqual(incrementedValue2, 2)
	})

	test('verify if has key', async () => {
		const key = 'test-key-exists'
		const value = 'test-value-exists'

		await redis.set(key, value, {
			expires: 1
		})
		const exists = await redis.has(key)
		assert.strictEqual(exists, true)

		const notExists = await redis.has('non-existing-key')
		assert.strictEqual(notExists, false)
	})

	test('delete key', async () => {
		const key = 'test-key-delete'
		const value = 'test-value-delete'
		await redis.set(key, value, {
			expires: 1
		})

		const existsBeforeDelete = await redis.has(key)
		assert.strictEqual(existsBeforeDelete, true)

		await redis.delete(key)
		const existsAfterDelete = await redis.has(key)
		assert.strictEqual(existsAfterDelete, false)
	})

	test('set with empty key', async () => {
		await assert.rejects(
			async () => {
				await redis.set('', 'value', { expires: 1 })
			},
			{
				name: 'Error',
				message: 'Key must be a non-empty string'
			}
		)
	})

	test('set with invalid expires', async () => {
		await assert.rejects(
			async () => {
				await redis.set('key', 'value', { expires: 0 })
			},
			{
				name: 'Error',
				message: 'Expires must be greater than 0'
			}
		)
	})

	test('increment with empty key', async () => {
		await assert.rejects(
			async () => {
				await redis.increment('', { expires: 1 })
			},
			{
				name: 'Error',
				message: 'Key must be a non-empty string'
			}
		)
	})
})