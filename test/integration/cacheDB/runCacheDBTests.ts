import test, { after, before } from 'node:test'
import assert from 'node:assert'
import { setTimeout } from 'node:timers/promises'

import type ICacheDB from '../../../src/infrastructure/ports/ICacheDB.ts'

export function runCacheDBTests(client: ICacheDB) {
  const items: Record<string, string> = {
		'test:key0': 'value0',
		'test:key1': 'value1'
	}
	const expires = 9

  before(async () => {
		const key0 = Object.keys(items)[0]
		const key1 = Object.keys(items)[1]

    await client.set(key0, items[key0], {
			expires
		})
    await client.set(key1, items[key1], {
			expires
		})
  })

	after(async () => {
		await client.disconnect()
	})

	test('Verify if has key', async () => {
		const key0 = Object.keys(items)[0]

		const exists = await client.has(key0)
		assert.strictEqual(exists, true)

		const notExists = await client.has('non-existing-key')
		assert.strictEqual(notExists, false)
	})

  test('Get existing key', async () => {
		const key0 = Object.keys(items)[0]

    const value = await client.get(key0)
    assert.strictEqual(value, items[key0])
  })

	test('Get non-existing key', async () => {
		const value = await client.get('non-existing-key')
		assert.strictEqual(value, null)
	})

  test('increment with fixed window', async () => {
		const key0 = Object.keys(items)[0]

		const incrementedValue1 = await client.increment(key0, {
			expires
		})
		assert.strictEqual(incrementedValue1, 1)

		const incrementedValue2 = await client.increment(key0, {
			expires
		})
		assert.strictEqual(incrementedValue2, 2)
	})

	test('increment with sliding window', async () => {
		const key1 = Object.keys(items)[1]

		const incrementedValue1 = await client.increment(key1, {
			expires,
			slidingWindow: true
		})
		assert.strictEqual(incrementedValue1, 1)

		const incrementedValue2 = await client.increment(key1, {
			expires,
			slidingWindow: true
		})
		assert.strictEqual(incrementedValue2, 2)
	})

	test('set with empty key', async () => {
		await assert.rejects(
			async () => {
				await client.set('', 'value', { expires })
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
				await client.set('key', 'value', { expires: 0 })
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
				await client.increment('', {
					expires
				})
			},
			{
				name: 'Error',
				message: 'Key must be a non-empty string'
			}
		)
	})

	test('Delete key', async () => {
		const key0 = Object.keys(items)[0]

    await client.delete(key0)
    const value = await client.has(key0)
    assert.strictEqual(value, false)
  })

	test('Keys is expired', async () => {
		const expires = 1
		const key = 'test:key:expires'

		await client.set(key, 'value2', {
			expires
		})

		await setTimeout(1001)

		const exists = await client.has(key)
		assert.strictEqual(exists, false)
	})
}