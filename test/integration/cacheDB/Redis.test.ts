import { describe } from 'node:test'

import Redis from '../../../src/infrastructure/gateway/cacheDB/Redis.ts'
import { runCacheDBTests } from './runCacheDBTests.ts'

const client = new Redis('redis://localhost:6379')

describe('Redis CacheDB', () => {
	runCacheDBTests(client)
})