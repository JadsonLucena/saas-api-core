import test, { before } from 'node:test'
import assert from 'node:assert'

import type { ISM, ISecret } from '../../../src/application/ports/ISM.ts'

export function runSecretManagerTests(client: ISM) {
  const secrets: ISecret[] = []

  before(async () => {
    for await (const list of client.list()) {
      list.forEach(secret => secrets.push(secret))
    }
  })

  test('List secrets', async () => {
    assert.strictEqual(secrets.length >= 1, true)
  })

  test('Get by name', async () => {
    const secret = await client.get(secrets[0].name)
    assert.deepStrictEqual(secrets[0], secret)
  })

  test('Get active versions', async () => {
    const secret = await client.get(secrets[0].name)
    const activeVersions = secret?.getActiveVersions()
    assert.strictEqual(activeVersions?.length, 1)
  })

  test('Get latest active version', async () => {
    const secret = await client.get(secrets[0].name)
    const latestActiveVersion = secret?.getLatestActiveVersion()
    assert.strictEqual(latestActiveVersion?.enabled, true)
  })

  test('Get version by id', async () => {
    const secret = await client.get(secrets[0].name)
    const version = secret?.getVersion(secrets[0].versions[0].id)
    assert.deepStrictEqual(version, secrets[0].versions[0])
  })
}
