import { IRepository } from './IRepository.ts'
import { TRANSACTION_ISOLATION_LEVELS } from './ISqlDriver.ts'

export interface IUnitOfWork<Repos extends Record<string, IRepository<string, string>>> {
	begin(isolationLevel?: TRANSACTION_ISOLATION_LEVELS): Promise<IUnitOfWorkTransaction<Repos>>
}

export interface IUnitOfWorkTransaction<Repos extends Record<string, IRepository<string, string>>> {
	repos: Repos
	savepoint(name: string): Promise<boolean>
	commit(): Promise<void>
	rollback(savepoint?: string): Promise<void>
	release(): Promise<void>
}