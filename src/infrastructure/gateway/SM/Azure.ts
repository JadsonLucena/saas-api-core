import { SecretClient, type SecretProperties } from '@azure/keyvault-secrets'
import { ClientSecretCredential } from '@azure/identity'

import type { ISM, SMInfo } from '../../../application/ports/ISM.ts'
import type { CursorPagination } from '../../../application/ports/IPagination.ts'
import { PAGINATION } from '../../../config.ts'

export default class AzureSM implements ISM {
	private client: SecretClient

	constructor({
		name,
		tenantId,
		clientId,
		clientSecret
	}: {
		name: string,
		tenantId: string,
		clientId: string,
		clientSecret: string
	}) {
		const credential = new ClientSecretCredential(
			tenantId,
			clientId,
			clientSecret
		)

		this.client = new SecretClient(
			`https://${name}.vault.azure.net`,
			credential
		)
	}

	async *list({
		take = PAGINATION.MAX_TAKE,
		cursor
	}: CursorPagination = {}) {
    let page: Promise<SMInfo>[] = []
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

		return await this.mountResponse(secret.properties)
	}

	private async mountResponse(secret: SecretProperties) {
		const versions = await this.getVersions(secret.name!)

		return {
			id: secret.id!,
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
					version: version.version!,
					value: await this.getSecretValue(version.name!),
					enabled: version.enabled!,
					createdAt: version.createdOn!,
					expiresAt: version.expiresOn
				}
			}))
		}
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