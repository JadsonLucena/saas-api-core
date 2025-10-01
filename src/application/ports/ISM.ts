export interface ISM {
  list(pagination?: CursorPagination): AsyncIterable<ISecret[]>
  get(name: string): Promise<ISecret | undefined>
}

export type Version = {
  readonly id: string,
  readonly value: string,
  readonly enabled: boolean,
  readonly createdAt: Date,
  readonly expiresAt?: Date
}

export interface ISecret {
  // id: string
  readonly name: string
  readonly description: string
  readonly tags?: Record<string, string>
  readonly rotatesAt?: Date
  readonly createdAt: Date
  readonly lastModifiedAt?: Date
  readonly startsAt?: Date
  readonly expiresAt?: Date
  readonly versions: Version[]
  getVersion(id: string): Version | undefined
  getActiveVersions(): Version[]
  getLatestActiveVersion(): Version | undefined
}

type Pagination = {
  take?: number
}

export type CursorPagination = Pagination & {
  cursor?: string
}