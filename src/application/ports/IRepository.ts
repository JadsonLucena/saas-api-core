import type { OffsetPagination } from './IPagination.ts';
import type { IOpaqueEntity, ISequentialEntity } from '../../domain/models/Entity.ts';

export interface IRepository<Fields extends string, Collections extends string> {
	find(
		props: {
			filter: Filter<Fields, Collections>,
			sort?: Sort<Fields, Collections>,
			pagination?: Pagination
		}
	): Promise<(IOpaqueEntity | ISequentialEntity)[]>
	exists(filter: Filter<Fields, Collections>): Promise<boolean>
	count(filter: Filter<Fields, Collections>): Promise<number>
	save(entity: (IOpaqueEntity | ISequentialEntity)[]): Promise<(IOpaqueEntity | ISequentialEntity)[]>
	remove(entity: (IOpaqueEntity | ISequentialEntity)[]): Promise<boolean>
}

export interface IRepositoryTransaction<Fields extends string, Collections extends string> extends IRepository<Fields, Collections> {
	findForUpdate(
		props: {
			filter: Filter<Fields, Collections>,
			sort?: Sort<Fields, Collections>,
			pagination?: Pagination
		}
	): Promise<(IOpaqueEntity | ISequentialEntity)[]>
	findWithLockInShareMode(
		props: {
			filter: Filter<Fields, Collections>,
			sort?: Sort<Fields, Collections>,
			pagination?: Pagination
		}
	): Promise<(IOpaqueEntity | ISequentialEntity)[]>
}

export type Filter<Fields extends string, Collections extends string> = LogicalOperatorFilter<Fields, Collections> & SimpleFilter<Fields, Collections>

export type SimpleFilter<Fields extends string, Collections extends string> = {
	[field in Fields]?: SimpleFilterValue<Collections>
}

export type LogicalOperatorFilter<Fields extends string, Collections extends string> = {
	[operator in LOGICAL_OPERATOR]?: LogicalOperatorFilterValue<Fields, Collections>
}

export type SimpleFilterValue<Collections extends string> = Primitive | Primitive[] | FieldFilter<Collections>
export type LogicalOperatorFilterValue<Fields extends string, Collections extends string> = Filter<Fields, Collections> | Filter<Fields, Collections>[]

export type FilterValue<Fields extends string, Collections extends string> = SimpleFilterValue<Collections> | LogicalOperatorFilterValue<Fields, Collections>

export const LOGICAL_OPERATOR = {
	AND: 'AND',
	OR: 'OR',
	NOT: 'NOT'
} as const
export type LOGICAL_OPERATOR = keyof typeof LOGICAL_OPERATOR

export const OPERATOR = {
	eq: '=',
	neq: '<>',
	lt: '<',
	lte: '<=',
	gt: '>',
	gte: '>=',
	in: 'IN',
	nin: 'NOT IN',
	between: 'BETWEEN',
	contains: 'LIKE',
	startsWith: 'LIKE',
	endsWith: 'LIKE'
}
export type OPERATOR = keyof typeof OPERATOR

export type FieldFilter<Collections extends string> = (
	{ eq: Primitive } |
	{ neq: Primitive } |
	{ lt: Exclude<Primitive, null> } |
	{ lte: Exclude<Primitive, null> } |
	{ gt: Exclude<Primitive, null> } |
	{ gte: Exclude<Primitive, null> } |
	{ in: Exclude<Primitive, null>[] } |
	{ nin: Exclude<Primitive, null>[] } |
	{ between: [Exclude<Primitive, null>, Exclude<Primitive, null>] } |
	{ contains: Extract<Primitive, string> } |
	{ startsWith: Extract<Primitive, string> } |
	{ endsWith: Extract<Primitive, string> }
) & {
	caseInsensitive?: boolean
	collection?: Collections
}

export type Primitive = Buffer | Date | bigint | boolean | null | number | string

export type Sort<Fields extends string, Collections extends string> = {
	[field in Fields]: SortValue<Collections>
}

export type SortValue<Collections extends string> = SORT_ORDER | {
	order: SORT_ORDER,
	collection?: Collections
}

export const SORT_ORDER = {
	ASC: 'ASC',
	DESC: 'DESC'
} as const
export type SORT_ORDER = typeof SORT_ORDER[keyof typeof SORT_ORDER]

export type Pagination = OffsetPagination

export const BIND_STYLES = {
  POSITIONAL_QUESTION: 'positional_question', // ?
  POSITIONAL_DOLLAR: 'positional_dollar', // $1, $2
  NAMED_COLON: 'named_colon', // :param
  NAMED_AT: 'named_at' // @param
} as const
export type BindStyle = typeof BIND_STYLES[keyof typeof BIND_STYLES]