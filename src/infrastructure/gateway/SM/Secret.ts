import type { ISecret, Version } from '../../../application/ports/ISM.ts'

export default class Secret implements ISecret {
	readonly name: string
	readonly description: string
	readonly tags?: Record<string, string>
	readonly rotatesAt?: Date
	readonly createdAt: Date
	readonly lastModifiedAt?: Date
	readonly startsAt?: Date
	readonly expiresAt?: Date
	readonly versions: Version[]
	
	constructor(props: {
		name: string,
		description: string,
		tags?: Record<string, string>,
		rotatesAt?: Date,
		createdAt: Date,
		lastModifiedAt?: Date,
		startsAt?: Date,
		expiresAt?: Date,
		versions: Version[]
	}) {
		this.name = props.name
		this.description = props.description
		this.tags = props.tags
		this.rotatesAt = props.rotatesAt
		this.createdAt = props.createdAt
		this.lastModifiedAt = props.lastModifiedAt
		this.startsAt = props.startsAt
		this.expiresAt = props.expiresAt
		this.versions = props.versions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
	}

	getVersion(id: string) {
		return this.versions.find((version) => version.id === id)
	}

	getActiveVersions() {
		return this.versions.filter((version) => version.enabled)
	}

	getLatestActiveVersion() {
		return this.getActiveVersions().at(-1)
	}
}