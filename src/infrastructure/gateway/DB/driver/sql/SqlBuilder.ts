import { DB, PAGINATION } from '../../../../../config.ts'

import {
	type Filter,
	type FilterValue,
	type LogicalOperatorFilterValue,
	type Sort,
	type SortValue,
	type Pagination,
	type BindStyle,
	type Primitive,
	type FieldFilter,
	LOGICAL_OPERATOR,
	BIND_STYLES,
	OPERATOR
} from '../../../../../application/ports/IRepository.ts'

export default function SqlBuilder<Fields extends string, Collections extends string>({
	filter,
	sort,
	pagination,
	bindStyle = BIND_STYLES.POSITIONAL_QUESTION
}: {
	filter?: Filter<Fields, Collections>,
	sort?: Sort<Fields, Collections>,
	pagination?: Pagination,
	bindStyle?: BindStyle
} = {}): {
	sql: string,
	params: Record<string, Primitive>
} {
	const sql: string[] = []
	const params: Record<string, Primitive> = {}

	if(filter) {
		const where = buildFilter<Fields, Collections>(filter, bindStyle)

		if (where.where) {
			sql.push(where.where)
			Object.assign(params, where.params)
		}
	}

	if (sort) {
		const orderBy = buildSort<Fields, Collections>(sort)

		if (orderBy) {
			sql.push(`ORDER BY ${orderBy}`)
		}
	}

	const page = buildPagination(pagination)

	sql.push(`OFFSET ${page.offset}`)
	sql.push(`LIMIT ${page.limit}`)

	return {
		sql: sql.join(' '),
		params: params
	}
}

export function buildFilter<Fields extends string, Collections extends string>(filter: Filter<Fields, Collections>, bindStyle: BindStyle) {
	const counter = new Int32Array(new SharedArrayBuffer(4))
	const { clauses, params } = buildWhere<Fields, Collections>(filter, bindStyle, counter)
	const where = clauses.join(` ${LOGICAL_OPERATOR.AND} `)

	if (!where || /^\(.+\)$/.test(where)) {
		return {
			where,
			params
		}
	}

	return {
		where: `(${where})`,
		params
	}
}

export function buildSort<Fields extends string, Collections extends string>(sort: Sort<Fields, Collections>) {
	const clauses: string[] = []

	Object.entries<SortValue<Collections>>(sort).forEach(([field, direction]) => {		
		if (typeof direction === 'object') {
			if (direction.collection) {
				return clauses.push(`${direction.collection}.${field} ${direction.order}`)
			}

			return clauses.push(`${field} ${direction.order}`)
		}

		clauses.push(`${field} ${direction}`)
	})

	return clauses.join(', ')
}

export function buildPagination({
	page = 1,
	perPage = PAGINATION.MAX_PER_PAGE
}: Pagination = {}) {
	if (page < 1) {
		throw new Error('page must be a positive number greater than 0')
	} else if (perPage < 1) {
		throw new Error('perPage must be a positive number greater than 0')
	} else if (perPage > PAGINATION.MAX_PER_PAGE) {
		throw new Error(`perPage must be less than or equal to ${PAGINATION.MAX_PER_PAGE}`)
	}

	return {
		offset: (page - 1) * perPage,
		limit: perPage
	}
}

function buildWhere<Fields extends string, Collections extends string>(
	filter: Filter<Fields, Collections>, 
	bindStyle: BindStyle, 
	counter: Int32Array<SharedArrayBuffer>, 
	depth: number = 1
) {
	if (depth > DB.MAX_FILTER_DEPTH) {
		throw new Error(`Filter depth exceeded the maximum limit of ${DB.MAX_FILTER_DEPTH}`)
	}

	const clauses: string[] = []
	const params: Record<string, Primitive> = {}

	const context: FilterContext = {
		bindStyle,
		counter,
		depth,
	}

	Object.entries<FilterValue<Fields, Collections>>(filter).forEach(([field, value]) => {
		if (value === undefined) {
			return
		}

		const filter = FilterStrategyFactory.getFilter(field, value)
		
		if (!filter) {
			return
		}

		const result = filter.execute(field, value, context)
		
		if (result.clause) {
			clauses.push(result.clause)
		}
		
		if (result.params) {
			Object.assign(params, result.params)
		}
	})

	return { clauses, params }
}

class FilterStrategyFactory {
	private static strategies<Fields extends string, Collections extends string>(): FilterStrategy<Fields, Collections>[] {
		return [
			new LogicalOperatorStrategy<Fields, Collections>(),
			new NullFilterStrategy<Fields, Collections>(),
			new ArrayFilterStrategy<Fields, Collections>(),
			new PrimitiveFilterStrategy<Fields, Collections>(),
			new ComparisonFilterStrategy<Fields, Collections>(),
			new StringMatchFilterStrategy<Fields, Collections>(),
			new BetweenFilterStrategy<Fields, Collections>()
		]
	}

	static getFilter<Fields extends string, Collections extends string>(
		field: Fields,
		value: FilterValue<Fields, Collections>
	): FilterStrategy<Fields, Collections> | undefined {
		return this.strategies<Fields, Collections>().find(c => c.canExecute(field, value))
	}
}

class LogicalOperatorStrategy<Fields extends string, Collections extends string> implements FilterStrategy<Fields, Collections> {
	canExecute(field: Fields, value: FilterValue<Fields, Collections>): boolean {
		return this.isLogicalOperator<Fields, Collections>(field, value)
	}

	private isLogicalOperator<Fields extends string, Collections extends string>(key: string, value: FilterValue<Fields, Collections>): value is LogicalOperatorFilterValue<Fields, Collections> {
		return key in LOGICAL_OPERATOR
	}

	execute(
		field: Fields, 
		value: LogicalOperatorFilterValue<Fields, Collections>, 
		context: FilterContext
	): FilterResult {
		const subClauses: string[] = []
		const params: Record<string, Primitive> = {}
		const filters = Array.isArray(value) ? value : [value]

		for (const subFilter of filters) {
			if (!subFilter) continue

			const { clauses: subClausesResult, params: subParams } = buildWhere(
				subFilter, 
				context.bindStyle, 
				context.counter, 
				context.depth + 1
			)

			Object.assign(params, subParams)
			subClauses.push(...subClausesResult)
		}

		if (!subClauses.length) {
			return {}
		}

		const logicalOperator = field === 'NOT' ? LOGICAL_OPERATOR.AND : field
		const joinedClauses = subClauses.join(` ${logicalOperator} `)

		let clause: string
		if (field === 'NOT') {
			clause = `NOT (${joinedClauses})`
		} else if (subClauses.length > 1) {
			clause = `(${joinedClauses})`
		} else {
			clause = joinedClauses
		}

		return { clause, params }
	}
}

class NullFilterStrategy<Fields extends string, Collections extends string> implements FilterStrategy<Fields, Collections> {
	canExecute(field: Fields, value: FilterValue<Fields, Collections>): boolean {
		return value === null
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	execute(field: Fields, _value: FilterValue<Fields, Collections>): FilterResult {
		return { clause: `${field} IS NULL` }
	}
}

class ArrayFilterStrategy<Fields extends string, Collections extends string> implements FilterStrategy<Fields, Collections> {
	canExecute(field: Fields, value: FilterValue<Fields, Collections>): boolean {
		if (Array.isArray(value)) {
			return true
		}

		if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			return 'in' in value || 'nin' in value
		}

		return false
	}

	execute(
		field: Fields, 
		value: Primitive[] | FieldFilter<Collections>,
		context: FilterContext
	): FilterResult {
		if (Array.isArray(value)) {
			return this.handleSimpleArray(field, value, context)
		}

		const column = getQualifiedColumnName(field, value.collection)

		if ('in' in value) {
			return this.handleArrayOperator('in', value.in, {
				column,
				field,
				counter: context.counter,
				caseInsensitive: value.caseInsensitive
			}, context.bindStyle)
		}

		if ('nin' in value) {
			return this.handleArrayOperator('nin', value.nin, {
				column,
				field,
				counter: context.counter,
				caseInsensitive: value.caseInsensitive
			}, context.bindStyle)
		}

		return {}
	}

	private handleSimpleArray(
		field: Fields, 
		values: Primitive[], 
		context: FilterContext
	): FilterResult {
		let params: Record<string, Primitive> = {}
		const placeholders = values.map(value => {
			const index = atomicIncrement(context.counter)
			const placeholder = getPlaceholder<Fields>(field, index, context.bindStyle)

			params = {
				...params,
				[getNamedPlaceholder<Fields>(field, index)]: value
			}

			return applyCaseModeIfNeeded({
				expr: placeholder,
				value,
				caseInsensitive: false
			})
		})
		
		const clause = `${applyCaseModeIfNeeded({
			expr: field,
			value: values,
			caseInsensitive: false
		})} ${OPERATOR.in} (${placeholders.join(', ')})`

		return { clause, params }
	}

	private handleArrayOperator(
		operator: 'in' | 'nin',
		values: Primitive[],
		metadata: { column: string, field: Fields, counter: Int32Array<SharedArrayBuffer>, caseInsensitive?: boolean },
		bindStyle: BindStyle
	): FilterResult {
		let params: Record<string, Primitive> = {}
		const placeholders = values.map(value => {
			const index = atomicIncrement(metadata.counter)
			const placeholder = getPlaceholder<Fields>(metadata.field, index, bindStyle)

			params = {
				...params,
				[getNamedPlaceholder<Fields>(metadata.field, index)]: value
			}

			return applyCaseModeIfNeeded({
				expr: placeholder,
				value,
				caseInsensitive: metadata.caseInsensitive
			})
		})
		
		const clause = `${applyCaseModeIfNeeded({
			expr: metadata.column,
			value: values,
			caseInsensitive: metadata.caseInsensitive
		})} ${OPERATOR[operator]} (${placeholders.join(', ')})`

		return { clause, params }
	}
}

class PrimitiveFilterStrategy<Fields extends string, Collections extends string> implements FilterStrategy<Fields, Collections> {
	canExecute(field: Fields, value: FilterValue<Fields, Collections>): boolean {
		return this.isPrimitiveValue(value)
	}

	private isPrimitiveValue(value: FilterValue<Fields, Collections>): boolean {
		return (
			value instanceof Buffer ||
			value instanceof Date ||
			typeof value === 'bigint' ||
			typeof value === 'boolean' ||
			typeof value === 'number' ||
			typeof value === 'string'
		)
	}

	execute(
		field: Fields, 
		value: Primitive, 
		context: FilterContext
	): FilterResult {
		const index = atomicIncrement(context.counter)
		const placeholder = getPlaceholder<Fields>(field, index, context.bindStyle)
		const clause = `${field} = ${placeholder}`
		const params = { [getNamedPlaceholder<Fields>(field, index)]: value }

		return { clause, params }
	}
}

class ComparisonFilterStrategy<Fields extends string, Collections extends string> implements FilterStrategy<Fields, Collections> {
	private readonly comparisonOperators = ['eq', 'neq', 'lt', 'lte', 'gt', 'gte'] as const

	canExecute(field: Fields, value: FilterValue<Fields, Collections>): boolean {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			return false
		}

		return this.comparisonOperators.some(op => op in value)
	}

	execute(
		field: Fields, 
		value: FieldFilter<Collections>, 
		context: FilterContext
	): FilterResult {
		const column = getQualifiedColumnName(field, value.collection)

		if ('eq' in value && value.eq === null) {
			return { clause: `${column} IS NULL` }
		}
		if ('neq' in value && value.neq === null) {
			return { clause: `${column} IS NOT NULL` }
		}

		for (const operator of this.comparisonOperators) {
			if (operator in value) {
				return this.buildComparison(operator, value[operator], {
					column,
					field,
					counter: context.counter,
					caseInsensitive: value.caseInsensitive
				}, context.bindStyle)
			}
		}

		return {}
	}

	private buildComparison(
		operator: OPERATOR,
		value: Primitive,
		metadata: { column: string, field: Fields, counter: Int32Array<SharedArrayBuffer>, caseInsensitive?: boolean },
		bindStyle: BindStyle
	): FilterResult {
		const index = atomicIncrement(metadata.counter)
		const placeholder = getPlaceholder<Fields>(metadata.field, index, bindStyle)
		const clause = `${applyCaseModeIfNeeded({
			expr: metadata.column,
			value,
			caseInsensitive: metadata.caseInsensitive
		})} ${OPERATOR[operator]} ${applyCaseModeIfNeeded({
			expr: placeholder,
			value,
			caseInsensitive: metadata.caseInsensitive
		})}`

		return {
			clause,
			params: {
				[getNamedPlaceholder<Fields>(metadata.field, index)]: value
			}
		}
	}
}

class StringMatchFilterStrategy<Fields extends string, Collections extends string> implements FilterStrategy<Fields, Collections> {
	private readonly stringOperators = ['contains', 'startsWith', 'endsWith'] as const

	canExecute(field: Fields, value: FilterValue<Fields, Collections>): boolean {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			return false
		}

		return this.stringOperators.some(op => op in value)
	}

	execute(
		field: Fields, 
		value: FieldFilter<Collections>,
		context: FilterContext
	): FilterResult {
		const column = getQualifiedColumnName(field, value.collection)

		for (const operator of this.stringOperators) {
			if (operator in value) {
				const pattern = this.buildPattern(operator, value[operator])
				const index = atomicIncrement(context.counter)
				const placeholder = getPlaceholder<Fields>(field, index, context.bindStyle)
				const clause = `${applyCaseModeIfNeeded({
					expr: column,
					value: pattern,
					caseInsensitive: value.caseInsensitive
				})} LIKE ${applyCaseModeIfNeeded({
					expr: placeholder,
					value: pattern,
					caseInsensitive: value.caseInsensitive
				})}`

				return {
					clause,
					params: {
						[getNamedPlaceholder<Fields>(field, index)]: pattern
					}
				}
			}
		}

		return {}
	}

	private buildPattern(operator: OPERATOR, value: string): string {
		switch (operator) {
			case 'contains': return `%${value}%`
			case 'startsWith': return `${value}%`
			case 'endsWith': return `%${value}`
			default: return value
		}
	}
}

class BetweenFilterStrategy<Fields extends string, Collections extends string> implements FilterStrategy<Fields, Collections> {
	canExecute(field: Fields, value: FilterValue<Fields, Collections>): boolean {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			return false
		}

		return 'between' in value
	}

	execute(
		field: Fields,
		value: FieldFilter<Collections>,
		context: FilterContext
	): FilterResult {
		if (!('between' in value)) {
			return {}
		}

		const column = getQualifiedColumnName(field, value.collection)

		const [initialValue, endValue] = value.between
		const initialIndex = atomicIncrement(context.counter)
		const endIndex = atomicIncrement(context.counter)

		const placeholderStart = getPlaceholder<Fields>(field, initialIndex, context.bindStyle)
		const placeholderEnd = getPlaceholder<Fields>(field, endIndex, context.bindStyle)

		const clause = `${applyCaseModeIfNeeded({
			expr: column,
			value: [initialValue, endValue],
			caseInsensitive: value.caseInsensitive
		})} BETWEEN ${applyCaseModeIfNeeded({
			expr: placeholderStart,
			value: initialValue,
			caseInsensitive: value.caseInsensitive
		})} AND ${applyCaseModeIfNeeded({
			expr: placeholderEnd,
			value: endValue,
			caseInsensitive: value.caseInsensitive
		})}`

		const params = {
			[getNamedPlaceholder<Fields>(field, initialIndex)]: initialValue,
			[getNamedPlaceholder<Fields>(field, endIndex)]: endValue
		}

		return { clause, params }
	}
}

function atomicIncrement(counter: Int32Array<SharedArrayBuffer>): number {
	return Atomics.add(counter, 0, 1) + 1
}

function getPlaceholder<Fields extends string>(field: Fields, index: number, bindStyle: BindStyle): string {
	switch (bindStyle) {
		case BIND_STYLES.NAMED_AT: return `@${getNamedPlaceholder<Fields>(field, index)}`
		case BIND_STYLES.NAMED_COLON: return `:${getNamedPlaceholder<Fields>(field, index)}`
		case BIND_STYLES.POSITIONAL_DOLLAR: return `$${index}`
		default: return `?`
	}
}

function getNamedPlaceholder<Fields extends string>(field: Fields, index: number): string {
	return `_${index}_${field}`
}

function getQualifiedColumnName<Fields extends string, Collections extends string>(field: Fields, collection?: Collections): string {
	if (collection && collection.length) {
		return `${collection}.${field}`
	}
	return field
}

function applyCaseModeIfNeeded(props: {
	expr: string,
	value: Primitive | Primitive[],
	caseInsensitive?: boolean
}) {
	if (
		props.caseInsensitive &&
		(
			typeof props.value === 'string' ||
			(Array.isArray(props.value) && props.value.some(value => typeof value === 'string'))
		) &&
		!props.expr.startsWith('LOWER(') && !props.expr.endsWith(')')
	) {
		return `LOWER(${props.expr})`
	}

	return props.expr
}

interface FilterStrategy<Fields extends string, Collections extends string> {
	canExecute(field: Fields, value: FilterValue<Fields, Collections>): boolean
	execute(
		field: Fields, 
		value: FilterValue<Fields, Collections>, 
		context: FilterContext
	): FilterResult
}

interface FilterContext {
	bindStyle: BindStyle
	counter: Int32Array<SharedArrayBuffer>
	depth: number
}

interface FilterResult {
	clause?: string
	params?: Record<string, Primitive>
}