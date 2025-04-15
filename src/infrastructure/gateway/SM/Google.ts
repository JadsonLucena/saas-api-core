import { SecretManagerServiceClient, protos } from '@google-cloud/secret-manager'
import type { JWTInput } from 'google-auth-library'

import type { ISM } from '../../ports/ISM.ts'
import type { CursorPagination } from '../../ports/IPagination.ts'
import { PAGINATION } from '../../../config.ts'
import { start } from 'repl'

export default class GoogleSM implements ISM {
  private readonly client: SecretManagerServiceClient
  private readonly projectId: string

  constructor({
		credential
	}: {
    credential: string
  }) {
    const parsedCredential: JWTInput = JSON.parse(Buffer.from(credential, 'base64').toString())

    if (!parsedCredential.project_id) {
      throw new Error('Invalid credentials: project_id is required')
    }

    this.projectId = parsedCredential.project_id!

    // Require the role `roles/secretmanager.secretAccessor` on the service account
    this.client = new SecretManagerServiceClient({
			credentials: parsedCredential
		})
  }

  async *list({
    take = PAGINATION.MAX_TAKE,
    cursor,
  }: CursorPagination = {}) {
    let nextPageToken: string | undefined | null = cursor
    while (true) {
      const [ secrets, _, res ] = await this.client.listSecrets({
        parent: `projects/${this.projectId}`,
        pageSize: take,
        pageToken: nextPageToken
      }, {
        autoPaginate: false
      })

      const secretInfos = await Promise.all(secrets.map(async secret => this.mountResponse(secret)))

      yield secretInfos.sort((a, b) => b.createAt.getTime() - a.createAt.getTime())

      nextPageToken = res.nextPageToken
      if (!nextPageToken) {
        break
      }
    }
  }

  async get(name: string) {
    const [ secret ] = await this.client.getSecret({
      name
    })

    return this.mountResponse(secret)
  }

  private async mountResponse(secret: protos.google.cloud.secretmanager.v1.ISecret) {
    const versions = await this.getVersions(secret.name!)

    return {
      id: secret.etag!,
      name: secret.name ?? '',
      description: secret.labels?.description || '',
      tags: secret.labels || {},
      rotatesAt: secret.rotation?.nextRotationTime ? new Date(Number(secret.rotation.nextRotationTime.seconds) * 1000) : undefined,
      createAt: new Date(Number(secret.createTime?.seconds) * 1000),
      lastModifiedAt: undefined,
      startsAt: undefined,
			expiresAt: secret.expireTime ? new Date(Number(secret.expireTime.seconds) * 1000) : undefined,
      versions: await Promise.all(versions.map(async version => {
        return {
          version: version.name?.split('/').pop() ?? '',
          value: await this.getSecretValue(version.name!),
          enabled: protos.google.cloud.secretmanager.v1.SecretVersion.State[version.state!] === protos.google.cloud.secretmanager.v1.SecretVersion.State.ENABLED,
          createAt: new Date(Number(version.createTime!.seconds) * 1000),
          expiresAt: version.destroyTime ? new Date(Number(version.destroyTime.seconds) * 1000) : undefined
        }
      }))
    }
  }

  private async getVersions(secretName: string) {
    const [ versions ] = await this.client.listSecretVersions({ parent: secretName })

    if (!versions) {
      return []
    }

    return versions.sort((a, b) => parseInt(b.createTime!.seconds!.toString()) - parseInt(a.createTime!.seconds!.toString()))
  }

  private async getSecretValue(name: string) {
    const [ version ] = await this.client.accessSecretVersion({
			name
		})

    return version.payload?.data?.toString() ?? ''
  }
}
