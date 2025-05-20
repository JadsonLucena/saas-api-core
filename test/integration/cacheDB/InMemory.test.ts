import { describe } from 'node:test'

import InMemory from '../../../src/infrastructure/gateway/cacheDB/InMemory.ts'
import { runCacheDBTests } from './runCacheDBTests.ts'

const client = new InMemory()

describe('InMemory CacheDB', () => {
	runCacheDBTests(client)
})