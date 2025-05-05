import fs from 'node:fs'

import { SecretManagerServiceClient, protos } from '@google-cloud/secret-manager'
import type { JWTInput } from 'google-auth-library'

import type { ISM } from '../../../application/ports/ISM.ts'
import type { CursorPagination } from '../../../application/ports/IPagination.ts'
import { PAGINATION } from '../../../config.ts'

export default class GoogleSM implements ISM {
  private readonly client: SecretManagerServiceClient

  constructor(props: GoogleSmProps) {
    const opts: {
      credentials?: JWTInput,
      projectId?: string
    } = {
      credentials: JSON.parse(Buffer.from('federatedTokenFile' in props ? props.federatedTokenFile : props.credential, 'base64').toString())
    }

    opts.projectId = props.projectId ?? opts.credentials?.project_id

    // Require the role `roles/secretmanager.secretAccessor` on the service account
    this.client = new SecretManagerServiceClient(opts)
  }

  async *list({
    take = PAGINATION.MAX_TAKE,
    cursor,
  }: CursorPagination = {}) {
    const projectId = await this.client.getProjectId()

    let nextPageToken: string | undefined | null = cursor
    while (true) {
      const [ secrets, _, res ] = await this.client.listSecrets({
        parent: `projects/${projectId}`,
        pageSize: take,
        pageToken: nextPageToken
      }, {
        autoPaginate: false
      })

      const secretInfos = await Promise.all(secrets.map(async secret => this.mountResponse(secret)))

      yield secretInfos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

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
      createdAt: new Date(Number(secret.createTime?.seconds) * 1000),
      lastModifiedAt: undefined,
      startsAt: undefined,
			expiresAt: secret.expireTime ? new Date(Number(secret.expireTime.seconds) * 1000) : undefined,
      versions: await Promise.all(versions.map(async version => {
        return {
          version: version.name?.split('/').pop() ?? '',
          value: await this.getSecretValue(version.name!),
          enabled: protos.google.cloud.secretmanager.v1.SecretVersion.State[version.state!] === protos.google.cloud.secretmanager.v1.SecretVersion.State.ENABLED,
          createdAt: new Date(Number(version.createTime!.seconds) * 1000),
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

export type GoogleSmProps = {
  projectId?: string
} & ({
  credential: string
} | {
  federatedTokenFile: string
})