import type ICacheDB from '../../ports/ICacheDB.ts'

import Memcached from 'memcached'

export default class CacheDB implements ICacheDB {
  private readonly connectionString: string | string[]
  private readonly client: Memcached
  private connected = false

  constructor(
    connectionString: string | string[]
  ) {
    this.connectionString = connectionString

    this.client = new Memcached(this.connectionString)

    this.client.on('issue', () => {
      this.connected = false
    })
    this.client.on('failure', details => {
      this.connected = false
      throw new Error(`Memcached failure: ${details.messages.join(', ')}`)
    })
    this.client.on('reconnecting', () => {
      this.connected = false
    })
    this.client.on('reconnected', () => {
      this.connected = true
    })
    this.client.on('remove', () => {
      this.connected = false
    })

    this.connected = true
  }

  disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.client.end()
        resolve()
      } catch (err) {
        reject(err)
      }
    })
  }

  isConnected(): boolean {
    return this.connected
  }

  get(key: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      if (!key.trim()) {
        throw new Error('Key must be a non-empty string')
      }

      this.client.get(key, (err, data) => {
        if (err) {
          return reject(err)
        }

        resolve(data ?? null)
      })
    })
  }

  has(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!key.trim()) {
        throw new Error('Key must be a non-empty string')
      }

      this.client.get(key, (err, data) => {
        if (err) {
          return reject(err)
        }

        resolve(Boolean(data))
      })
    })
  }

  set(
    key: string,
    value: string,
    {
      expires,
      replace = false
    }: {
      expires: number,
      replace?: boolean
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!key.trim()) {
        throw new Error('Key must be a non-empty string')
      } else if (expires <= 0) {
        throw new Error('Expires must be greater than 0')
      }

      function callback(err: Error) {
        if (err) {
          return reject(err)
        }

        resolve()
      }

      if (replace) {
        this.client.replace(key, value, expires, callback)
      } else {
        this.client.add(key, value, expires, callback)
      }
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
  ): Promise<number> {
    if (!key.trim()) {
      throw new Error('Key must be a non-empty string')
    } else if (expires <= 0) {
      throw new Error('Expires must be greater than 0')
    }

    if (!slidingWindow) {
      key = `fixed_window:${key}`

      let count: number = await new Promise((resolve, reject) => {
        this.client.incr(key, 1, (err, result) => {
          if (err) return reject(err)
    
          resolve(Number(result))
        })
      })

      if (!count) {
        count = 1
        await new Promise((resolve, reject) => {
          this.client.add(key, count, expires, (err, result) => {
            if (err) return reject(err)
      
            resolve(result)
          })
        }).catch(async () => {
          count = await new Promise((resolve, reject) => {
            this.client.incr(key, 1, (err, result) => {
              if (err) return reject(err)
        
              resolve(Number(result))
            })
          })
        })
      }

      return count
    }

    key = `sliding_window:${key}`

    return new Promise((resolve, reject) => {
      this.client.gets(key, (err, data) => {
        if (err) {
          return reject(err)
        }
        
        const delay = 3
        const currentTimestamp = performance.now()
  
        const timestamps = data && data[key] ? data[key] : []
        timestamps.push(currentTimestamp)
  
        for (const i in timestamps) {
          if (timestamps[i] < (currentTimestamp - expires * 1000)) {
            timestamps.shift()
            continue
          }
  
          break
        }
  
        if (data) {
          this.client.cas(key, timestamps, data.cas, expires + delay, err => {
            if (err) {
              return reject(err)
            }
  
            resolve(timestamps.length)
          })
        } else {
          this.client.add(key, timestamps, expires + delay, () => {
            resolve(timestamps.length)
          })
        }
      })
    })
  }

  async delete(key: string) {
    await new Promise((resolve, reject) => {
      if (!key.trim()) {
        throw new Error('Key must be a non-empty string')
      }

      this.client.del(key, (err, result) => {
        if (err) {
          return reject(err)
        }

        resolve(result)
      })
    })
  }

  async clear() {
    await new Promise((resolve, reject) => {
      this.client.flush((err, results) => {
        if (err) {
          return reject(err)
        }

        resolve(results)
      })
    })
  }
}