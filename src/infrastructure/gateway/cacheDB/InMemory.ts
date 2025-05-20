import type ICacheDB from '../../ports/ICacheDB.ts'

export default class CacheDB implements ICacheDB {
  private readonly maxMemory?: number
  private cacheSize: number
  private list: Record<string, {
    data: string,
    count: number[],
    expires: number,
    size: number,
    usageFrequency: number
  }>

  constructor (maxMemory?: number) {
    this.maxMemory = maxMemory
    this.list = {}
    this.cacheSize = 0
  }

  disconnect() {
    return Promise.resolve()
  }

  isConnected(): boolean {
    return true
  }

  async get(key: string) {
    if (!key.trim()) {
      throw new Error('Key must be a non-empty string')
    }

    this.deleteIfExpired(key)

    if (key in this.list) this.list[key].usageFrequency++

    return this.list[key]?.data ?? null
  }

  async has(key: string) {
    if (!key.trim()) {
      throw new Error('Key must be a non-empty string')
    }

    this.deleteIfExpired(key)

    if (key in this.list) this.list[key].usageFrequency++

    return key in this.list
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
    if (!key.trim()) {
      throw new Error('Key must be a non-empty string')
    } else if (expires <= 0) {
      throw new Error('Expires must be greater than 0')
    }

    if (!replace && key in this.list) {
      return
    }

    const size = Buffer.byteLength(value)
    const oldSize = this.list[key]?.size ?? 0

    this.removeIfMemoryLimitExceeded(size - oldSize)

    this.cacheSize += size - oldSize
    this.list[key] = {
      data: value,
      count: [],
      expires: new Date(Date.now() + expires * 1000).getTime(),
      size,
      usageFrequency: 0
    }
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

      this.deleteIfExpired(key)

      if (!this.list[key]) {
        this.list[key] = {
          data: '',
          count: [0],
          expires: new Date(Date.now() + expires * 1000).getTime(),
          size: 0,
          usageFrequency: Infinity
        }
      }

      return ++this.list[key].count[0]
    }

    key = `sliding_window:${key}`

    this.deleteIfExpired(key)

    const currentTimestamp = performance.now()

    if (!this.list[key]) {
      this.list[key] = {
        data: '',
        count: [],
        expires: new Date(Date.now() + expires * 1000).getTime(),
        size: 0,
        usageFrequency: Infinity
      }
    }

    this.list[key].count.push(currentTimestamp)
    this.list[key].expires = new Date(Date.now() + expires * 1000).getTime()

    for (const i in this.list[key].count) {
      if (this.list[key].count[i] < (currentTimestamp - expires * 1000)) {
        this.list[key].count.shift()
        continue
      }

      break
    }

    return this.list[key].count.length
  }

  async delete (key: string) {
    if (!key.trim()) {
      throw new Error('Key must be a non-empty string')
    }

    this.cacheSize -= this.list[key].size
    delete this.list[key]
  }

  async clear () {
    this.cacheSize = 0
    this.list = {}
  }

  private deleteIfExpired (key: string) {
    if (!this.list[key]?.expires) {
      return
    }

    if (this.list[key].expires < Date.now()){
      this.delete(key)
    }
  }

  private removeIfMemoryLimitExceeded(bytes: number) {
    if (!this.maxMemory) {
      return
    }

    const entries = Object.entries(this.list)
    let size = this.cacheSize + bytes

    if (size <= this.maxMemory) {
      return
    }

    const entriesSorted = entries
      .sort(([, a], [, b]) => a.expires - b.expires) // get the oldest first
      .sort(([, a], [, b]) => a.usageFrequency - b.usageFrequency) // Of the oldest, get the least accessed

    for (const [key, info] of entriesSorted) {
      size -= info.size

      this.delete(key)

      if (this.maxMemory && size <= this.maxMemory) {
        break
      }
    }
  }
}
