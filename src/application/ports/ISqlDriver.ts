import type { Primitive } from './IRepository.ts'

export interface ISqlDriver extends IDmlDriver {
	beginTransaction(isolationLevel?: TransactionIsolationLevel): Promise<ITransactionDriver>
	disconnect(): Promise<void>
}

export interface ITransactionDriver extends IDmlDriver {
	savepoint(name: string): Promise<boolean>
	commit(): Promise<void>
	rollback(savepoint?: string): Promise<void>
	releaseSavepoint(name: string): Promise<boolean>
}

export type TransactionIsolationLevel = 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE'

interface IDmlDriver {
	query<T extends Result>(
		sql: string,
		params?: Params
	): Promise<T[]>
}

export type Result = Record<string, Primitive>
export type Params = Record<string, Primitive>