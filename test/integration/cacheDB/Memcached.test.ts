import { describe } from 'node:test'

import Memcached from '../../../src/infrastructure/gateway/cacheDB/Memcached.ts'
import { runCacheDBTests } from './runCacheDBTests.ts'

const client = new Memcached('localhost:11211')

describe('Memcached CacheDB', () => {
	runCacheDBTests(client)
})