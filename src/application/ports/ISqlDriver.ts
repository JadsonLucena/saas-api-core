import type { Primitive } from './IRepository.ts'

export interface ISqlDriver extends IDmlDriver {
	beginTransaction(isolationLevel?: TRANSACTION_ISOLATION_LEVELS): Promise<ITransactionDriver>
	disconnect(): Promise<void>
}

export interface ITransactionDriver extends IDmlDriver {
	savepoint(name: string): Promise<boolean>
	commit(): Promise<void>
	rollback(savepoint?: string): Promise<void>
	releaseSavepoint(name: string): Promise<boolean>
}

export const TRANSACTION_ISOLATION_LEVELS = {
	'READ_UNCOMMITTED': 'READ UNCOMMITTED',
	'READ_COMMITTED': 'READ COMMITTED',
	'REPEATABLE_READ': 'REPEATABLE READ',
	'SERIALIZABLE': 'SERIALIZABLE'
} as const
export type TRANSACTION_ISOLATION_LEVELS = typeof TRANSACTION_ISOLATION_LEVELS[keyof typeof TRANSACTION_ISOLATION_LEVELS]

interface IDmlDriver {
	query<T extends Result>(
		sql: string,
		params?: Params
	): Promise<T[]>
}

export type Result = Record<string, Primitive>
export type Params = Record<string, Primitive>