import {
	SecretsManagerClient,
	ListSecretsCommand,
	GetSecretValueCommand,
	DescribeSecretCommand,
  type SecretListEntry,
  type DescribeSecretCommandOutput
} from '@aws-sdk/client-secrets-manager'

import type { ISM } from '../../ports/ISM.ts'
import type { CursorPagination } from '../../ports/IPagination.ts'
import { PAGINATION } from '../../../config.ts'

export default class AwsSM implements ISM {
  private client: SecretsManagerClient

  constructor({
    region,
    accessKeyId,
    secretAccessKey
  }: {
    region: string,
		accessKeyId: string,
		secretAccessKey: string
	}) {
    this.client = new SecretsManagerClient({
      apiVersion: '2017-10-17',
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
		})
  }

  async *list({
    take = PAGINATION.MAX_TAKE,
    cursor,
  }: CursorPagination = {}) {
    let nextPageToken: string | undefined | null = cursor
    while (true) {
      const { SecretList, NextToken } = await this.client.send(new ListSecretsCommand({
        MaxResults: take,
        NextToken: nextPageToken
      }))

      const secretInfos = await Promise.all((SecretList ?? []).map(secretMetadata => this.mountResponse(secretMetadata)))

      yield secretInfos.sort((a, b) => b.createAt.getTime() - a.createAt.getTime())

      nextPageToken = NextToken
      if (!nextPageToken) {
        break
      }
    }
  }

  async get(name: string) {
    const secret = await this.client.send(new DescribeSecretCommand({
      SecretId: name
    }))

    return this.mountResponse(secret)
  }

  private async mountResponse(secret: SecretListEntry | DescribeSecretCommandOutput) {
    const versions = await this.getVersions(secret)

		return {
      id: secret.ARN!,
      name: secret.Name!,
      description: secret.Description!,
      tags: secret.Tags?.reduce((acc, tag) => {
        acc[tag.Key!] = tag.Value!
        return acc
      }, {} as Record<string, string>) || {},
      rotatesAt: secret.NextRotationDate,
      createAt: secret.CreatedDate!,
      lastModifiedAt: secret.LastChangedDate,
      startsAt: undefined,
      expiresAt: undefined,
      versions: await Promise.all(versions.map(version => {
        return {
          version: version.VersionId!,
          value: version.SecretString!,
          enabled: Boolean(version.VersionStages?.includes('AWSCURRENT')),
          createAt: new Date(version?.CreatedDate!),
          expiresAt: undefined
        }
      }))
    }
	}

  private async getVersions(secret: SecretListEntry | DescribeSecretCommandOutput) {
    const versions = (secret as SecretListEntry).SecretVersionsToStages ?? (secret as DescribeSecretCommandOutput).VersionIdsToStages

    return (await Promise.all(Object.entries(versions ?? []).map(([VersionId]) => {
      return this.client.send(new GetSecretValueCommand({
        SecretId: secret.ARN!,
        VersionId
      }))
    }))).sort((a, b) => b.CreatedDate!.getTime() - a.CreatedDate!.getTime())
  }
}
