import type ICacheDB from '../../ports/ICacheDB.ts'

import { createClient, createCluster, type RedisClientType, type RedisClusterType } from 'redis'

export default class CacheDB implements ICacheDB {
  private readonly connectionString: string | string[]
  private readonly maxMemory: number | undefined
  private readonly client: RedisClientType | RedisClusterType
  private connected = false

  constructor (
    connectionString: string | string[],
    maxMemory?: number
  ) {
    this.connectionString = connectionString
    this.maxMemory = maxMemory

    if (Array.isArray(this.connectionString)) {
      this.client = createCluster({
        rootNodes: this.connectionString.map(url => ({
          url
        }))
      })
    } else {
      this.client = createClient({
        url: this.connectionString
      })
    }

    this.client.on('connect', () => {
      this.connected = true
    })
    this.client.on('end', () => {
      this.connected = false
    })
    this.client.on('error', (err: Error) => {
      this.connected = false
      throw err
    })
  }

  private async connect() {
    if (!this.connected) {
      await this.client.connect()

      if (this.maxMemory) {
        // check if this.client is of the type RedisClientType

        if ('masters' in this.client) {
          for (const node of this.client.masters) {
            await (await node.client)?.configSet({
              'maxmemory': this.maxMemory.toString(),
              'maxmemory-policy': 'allkeys-lfu'
            })
          }
        } else {
          await this.client.configSet({
            'maxmemory': this.maxMemory.toString(),
            'maxmemory-policy': 'allkeys-lfu'
          })
        }
      }

      this.connected = true
    }
  }

  async disconnect() {
    await this.client.disconnect()
    // await this.client.quit()
    this.connected = false
  }

  isConnected(): boolean {
    return this.connected
  }

  async get(key: string) {
    await this.connect()

    if (!key.trim()) {
      throw new Error('Key must be a non-empty string')
    }

    return await this.client.get(key)
  }

  async has(key: string) {
    await this.connect()

    if (!key.trim()) {
      throw new Error('Key must be a non-empty string')
    }

    return await this.client.exists(key) > 0
  }

  async set(
    key: string,
    value: string,
    {
      expires,
      replace = false
    }: {
      expires: number,
      replace?: boolean
    }
  ) {
    await this.connect()

    if (!key.trim()) {
      throw new Error('Key must be a non-empty string')
    } else if (expires <= 0) {
      throw new Error('Expires must be greater than 0')
    }

    await this.client.set(key, value, {
      EX: expires,
      NX: replace ? undefined : true
    })
  }

  async increment(
    key: string,
    {
      expires,
      slidingWindow = false
    }: {
      expires: number,
      slidingWindow?: boolean
    }
  ) {
    await this.connect()

    if (!key.trim()) {
      throw new Error('Key must be a non-empty string')
    } else if (expires <= 0) {
      throw new Error('Expires must be greater than 0')
    }

    if (!slidingWindow) {
      key = `fixed_window:${key}`

      const count = await this.client.incr(key)

      if (count === 1) {
        this.client.expire(key, expires)
      }

      return count
    }

    key = `sliding_window:${key}`

    const currentTimestamp = performance.now()

    await Promise.all([
      this.client.zRemRangeByScore(key, '-inf', (currentTimestamp - expires * 1000).toString()),
      this.client.zAdd(key, {
        score: currentTimestamp,
        value: currentTimestamp.toString()
      })
    ])

    this.client.expire(key, expires)

    return await this.client.zCard(key)
  }

  async delete (key: string): Promise<void> {
    await this.connect()

    if (!key.trim()) {
      throw new Error('Key must be a non-empty string')
    }

    await this.client.del(key)
  }

  async clear () {
    await this.connect()

    if ('flushAll' in this.client) {
      await this.client.flushAll()
    } else {
      for (const node of this.client.masters) {
        await (await node.client)?.flushAll()
      }
    }
  }
}
