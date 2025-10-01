import assert from 'node:assert'
import type { ISM, ISecret } from '../../../src/application/ports/ISM.ts'

export function secretManagerTestFactory(client: ISM) {
  const secrets: ISecret[] = []

  async function setup() {
    for await (const list of client.list()) {
      list.forEach(secret => secrets.push(secret))
    }
  }

  return {
    setup,
    listSecrets: async () => {
      assert.strictEqual(secrets.length >= 1, true)
    },
    getByName: async () => {
      const secret = await client.get(secrets[0].name)
      assert.deepStrictEqual(secrets[0], secret)
    },
    getActiveVersions: async () => {
      const secret = await client.get(secrets[0].name)
      const activeVersions = secret?.getActiveVersions()
      assert.strictEqual(activeVersions?.length, 1)
    },
    getLatestActiveVersion: async () => {
      const secret = await client.get(secrets[0].name)
      const latestActiveVersion = secret?.getLatestActiveVersion()
      assert.strictEqual(latestActiveVersion?.enabled, true)
    },
    getVersionById: async () => {
      const secret = await client.get(secrets[0].name)
      const version = secret?.getVersion(secrets[0].versions[0].id)
      assert.deepStrictEqual(version, secrets[0].versions[0])
    }
  }
}
