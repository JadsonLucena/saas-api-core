export type CursorPagination = Pagination & {
  cursor?: string
}

type Pagination = {
  take?: number
}

export interface ISM {
  list(pagination?: CursorPagination): AsyncIterable<SMInfo[]>
  get(name: string): Promise<SMInfo | undefined>
}

export type SMInfo = {
  id: string,
  name: string,
  description: string,
  tags?: Record<string, string>,
  rotatesAt?: Date,
  createdAt: Date,
  lastModifiedAt?: Date,
  startsAt?: Date,
  expiresAt?: Date,
  versions: {
    version: string,
    value: string,
    enabled: boolean,
    createdAt: Date,
    expiresAt?: Date
  }[]
}