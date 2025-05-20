import { SecretClient, type SecretProperties } from '@azure/keyvault-secrets'
import { WorkloadIdentityCredential, ClientSecretCredential } from '@azure/identity'

import { PAGINATION } from '../../../config.ts'

import type { ISM, CursorPagination } from '../../../application/ports/ISM.ts'
import Secret from './Secret.ts'

export default class AzureSM implements ISM {
	private client: SecretClient

	constructor(props: AzureSmProps) {
		if ('federatedTokenFile' in props && props.federatedTokenFile?.trim()) {
			this.client = new SecretClient(
				props.uri.toString(),
				new WorkloadIdentityCredential({
					tenantId: props.tenantId,
					clientId: props.clientId,
					tokenFilePath: props.federatedTokenFile
				})
			)
		} else if ('clientSecret' in props && props.clientSecret?.trim()) {
			this.client = new SecretClient(
			props.uri.toString(),
			new ClientSecretCredential(
					props.tenantId,
					props.clientId,
					props.clientSecret
				)
			)
		}
	}

	async *list({
		take = PAGINATION.MAX_TAKE,
		cursor
	}: CursorPagination = {}) {
    let page: Promise<Secret>[] = []
    let count = 0
    let cursorReached = false

    for await (const properties of this.client.listPropertiesOfSecrets()) {
      if (!cursorReached) {
        if (cursor && properties.id !== cursor) {
					continue
        }

				cursorReached = true
      }

      page.push(this.mountResponse(properties))
      count++

      if (count >= take) {
        yield await Promise.all(page)
        page = []
        count = 0
      }
    }

    if (page.length) {
      yield await Promise.all(page)
    }
	}

	async get(name: string) {
		const secret = await this.client.getSecret(name)

		secret.properties.id = secret.properties.id?.replace(`/${secret.properties.version!}`, '')

		return await this.mountResponse(secret.properties)
	}

	private async mountResponse(secret: SecretProperties): Promise<Secret> {
		const versions = await this.getVersions(secret.name!)

		return new Secret({
			// id: secret.id!,
			name: secret.name,
			description: '',
			tags: secret.tags,
			rotatesAt: undefined,
			createdAt: secret.createdOn!,
			lastModifiedAt: secret.updatedOn,
			startsAt: secret.notBefore,
			expiresAt: secret.expiresOn,
			versions: await Promise.all(versions.map(async version => {
				return {
					id: version.version!,
					value: await this.getSecretValue(version.name!),
					enabled: version.enabled!,
					createdAt: version.createdOn!,
					expiresAt: version.expiresOn
				}
			}))
		})
	}

	private async getVersions(secretName: string) {
		const versions: SecretProperties[] = []

		for await (const version of this.client.listPropertiesOfSecretVersions(secretName)) {
			versions.push(version)
		}

		return versions
	}

	private async getSecretValue(secretName: string) {
		const secret = await this.client.getSecret(secretName)

		return secret.value ?? ''
	}
}

export type AzureSmProps = {
	uri: URL,
	tenantId: string,
	clientId: string,
} & ({
	clientSecret: string
} | {
	federatedTokenFile: string
})