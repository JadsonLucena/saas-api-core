import test, { before, after, describe } from 'node:test'

import Memcached from '../../../src/infrastructure/gateway/cacheDB/Memcached.ts'
import { cacheDBTestFactory } from './cacheDBTestFactory.ts'

const client = new Memcached('localhost:11211')
const tests = cacheDBTestFactory(client)

describe('Memcached CacheDB', () => {
	before(tests.setup)
	after(tests.teardown)
	
	test('Verify if has key', tests.verifyHasKey)
	test('Get existing key', tests.getExistingKey)
	test('Get non-existing key', tests.getNonExistingKey)
	test('increment with fixed window', tests.incrementWithFixedWindow)
	test('increment with sliding window', tests.incrementWithSlidingWindow)
	test('set with empty key', tests.setWithEmptyKey)
	test('set with invalid expires', tests.setWithInvalidExpires)
	test('increment with empty key', tests.incrementWithEmptyKey)
	test('Delete key', tests.deleteKey)
	test('Keys is expired', tests.keysIsExpired)
})