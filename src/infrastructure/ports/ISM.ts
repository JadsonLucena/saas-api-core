import { CursorPagination } from './IPagination.ts'

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
  createAt: Date,
  lastModifiedAt?: Date,
  startsAt?: Date,
  expiresAt?: Date,
  versions: {
    version: string,
    value: string,
    enabled: boolean,
    createAt: Date,
    expiresAt?: Date
  }[]
}