import { DB, PAGINATION } from '../../../../../config.ts'

import {
	type Filter,
	type FilterValue,
	type CompoundFilterValue,
	type Sort,
	type SortValue,
	type Pagination,
	type BindStyle,
	type Primitive,
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
	params: Record<string, Primitive>[]
} {
	const sql: string[] = []
	const params: Record<string, Primitive>[] = []

	if(filter) {
		const where = buildWhere<Fields, Collections>(filter, bindStyle)

		if (where.clauses) {
			sql.push(where.clauses)
			params.push(...where.params)
		}
	}

	if (sort) {
		const orderBy = buildOrderBy<Fields, Collections>(sort)

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

export function buildWhere<Fields extends string, Collections extends string>(filter: Filter<Fields, Collections>, bindStyle: BindStyle) {
	const params: Record<string, Primitive>[] = []

	const buildClauses = <Fields extends string, Collections extends string>(filter: Filter<Fields, Collections>, depth: number = 1): string[] => {
		if (depth > DB.MAX_FILTER_DEPTH) {
			throw new Error(`Filter depth exceeded the maximum limit of ${DB.MAX_FILTER_DEPTH}`)
		}

		const clauses: string[] = []

		Object.entries<FilterValue<Fields, Collections>>(filter).forEach(([field, value]) => {
			if (isCompoundFilter<Fields, Collections>(field, value)) {
				const subFilters = (Array.isArray(value) ? value : [value])
					.filter(Boolean)
					.map(subFilter => buildClauses(subFilter, depth + 1))
					.flat()

				if (!subFilters.length) {
					return
				}

				if (field === 'NOT') {
					return clauses.push(`NOT (${subFilters.join(` ${LOGICAL_OPERATOR.AND} `)})`)
				}

				return clauses.push(`(${subFilters.join(` ${field} `)})`)
			}

			const index = params.length + 1

			if (value === undefined) {
				return
			} else if (value === null) {
				return clauses.push(`${field} IS NULL`)
			} else if (Array.isArray(value)) {
				 const buildedIn = buildList<Fields>(
					{
						values: value,
						operator: 'in'
					}, {
						column: field,
						field,
						index
					},
					bindStyle
				)

				clauses.push(buildedIn.clause)
				return params.push(...buildedIn.params)
			} else if (
				typeof value === 'string' ||
				typeof value === 'number' ||
				typeof value === 'boolean' ||
				typeof value === 'bigint' ||
				value instanceof Date
			) {
				const placeholder = getPlaceholder<Fields>(field, index, bindStyle)
				clauses.push(`${field} = ${placeholder}`)

				return params.push({
					[getNamedPlaceholder<Fields>(field, index)]: value
				})
			}

			const column = applyCollectionIfNeeded<Fields, Collections>({
				field,
				collection: value.collection
			})

			if (
				'eq' in value &&
				value.eq === null
			) {
				clauses.push(`${column} IS NULL`)
			} else if (
				'neq' in value &&
				value.neq === null
			) {
				clauses.push(`${column} IS NOT NULL`)
			} else if ('eq' in value) {
				const buildedComparison = buildComparison<Fields>(
					{
						value: value.eq,
						caseInsensitive: value.caseInsensitive,
						operator: 'eq'
					}, {
						column,
						field,
						index
					},
					bindStyle
				)

				clauses.push(buildedComparison.clause)
				params.push(...buildedComparison.params)
			} else if ('neq' in value) {
				const buildedComparison = buildComparison<Fields>(
					{
						value: value.neq,
						caseInsensitive: value.caseInsensitive,
						operator: 'neq'
					}, {
						column,
						field,
						index
					},
					bindStyle
				)

				clauses.push(buildedComparison.clause)
				params.push(...buildedComparison.params)
			} else if ('lt' in value) {
				const buildedComparison = buildComparison<Fields>(
					{
						value: value.lt,
						caseInsensitive: value.caseInsensitive,
						operator: 'lt'
					}, {
						column,
						field,
						index
					},
					bindStyle
				)

				clauses.push(buildedComparison.clause)
				params.push(...buildedComparison.params)
			} else if ('lte' in value) {
				const buildedComparison = buildComparison<Fields>(
					{
						value: value.lte,
						caseInsensitive: value.caseInsensitive,
						operator: 'lte'
					}, {
						column,
						field,
						index
					},
					bindStyle
				)

				clauses.push(buildedComparison.clause)
				params.push(...buildedComparison.params)
			} else if ('gt' in value) {
				const buildedComparison = buildComparison<Fields>(
					{
						value: value.gt,
						caseInsensitive: value.caseInsensitive,
						operator: 'gt'
					}, {
						column,
						field,
						index
					},
					bindStyle
				)

				clauses.push(buildedComparison.clause)
				params.push(...buildedComparison.params)
			} else if ('gte' in value) {
				const buildedComparison = buildComparison<Fields>(
					{
						value: value.gte,
						caseInsensitive: value.caseInsensitive,
						operator: 'gte'
					}, {
						column,
						field,
						index
					},
					bindStyle
				)

				clauses.push(buildedComparison.clause)
				params.push(...buildedComparison.params)
			} else if ('in' in value) {
				const buildedIn = buildList<Fields>(
					{
						values: value.in,
						caseInsensitive: value.caseInsensitive,
						operator: 'in'
					}, {
						column,
						field,
						index
					},
					bindStyle
				)

				clauses.push(buildedIn.clause)
				params.push(...buildedIn.params)
			} else if ('nin' in value) {
				const buildedIn = buildList<Fields>(
					{
						values: value.nin,
						caseInsensitive: value.caseInsensitive,
						operator: 'nin'
					}, {
						column,
						field,
						index
					},
					bindStyle
				)

				clauses.push(buildedIn.clause)
				params.push(...buildedIn.params)
			} else if ('between' in value) {
				const [valueStart, valueEnd] = value.between

				const placeholderStart = getPlaceholder<Fields>(field, index, bindStyle)
				params.push({
					[getNamedPlaceholder<Fields>(field, index)]: valueStart
				})

				const placeholderEnd = getPlaceholder<Fields>(field, index + 1, bindStyle)
				params.push({
					[getNamedPlaceholder<Fields>(field, index + 1)]: valueEnd
				})

				clauses.push(`${applyCaseModeIfNeeded({
					expr: column,
					value: [valueStart, valueEnd],
					caseInsensitive: value.caseInsensitive
				})} BETWEEN ${applyCaseModeIfNeeded({
					expr: placeholderStart,
					value: valueStart,
					caseInsensitive: value.caseInsensitive
				})} AND ${applyCaseModeIfNeeded({
					expr: placeholderEnd,
					value: valueEnd,
					caseInsensitive: value.caseInsensitive
				})}`)
			} else if ('contains' in value) {
				const buildedLike = buildMatch<Fields>(
					{
						value: `%${value.contains}%`,
						caseInsensitive: value.caseInsensitive
					}, {
						column,
						field,
						index
					},
					bindStyle
				)

				clauses.push(buildedLike.clause)
				params.push(...buildedLike.params)
			} else if ('startsWith' in value) {
				const buildedLike = buildMatch<Fields>(
					{
						value: `${value.startsWith}%`,
						caseInsensitive: value.caseInsensitive
					}, {
						column,
						field,
						index
					},
					bindStyle
				)

				clauses.push(buildedLike.clause)
				params.push(...buildedLike.params)
			} else if ('endsWith' in value) {
				const buildedLike = buildMatch<Fields>(
					{
						value: `%${value.endsWith}`,
						caseInsensitive: value.caseInsensitive
					}, {
						column,
						field,
						index
					},
					bindStyle
				)

				clauses.push(buildedLike.clause)
				params.push(...buildedLike.params)
			}
		})

		return clauses
	}

	const clauses = buildClauses<Fields, Collections>(filter).join(` ${LOGICAL_OPERATOR.AND} `)

	return {
		clauses: clauses.length ? `(${clauses})` : '',
		params
	}
}

export function buildOrderBy<Fields extends string, Collections extends string>(sort: Sort<Fields, Collections>) {
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

function getPlaceholder<Fields extends string>(field: Fields | string, index: number, bindStyle: BindStyle): string {
	switch (bindStyle) {
		case BIND_STYLES.NAMED_AT: return `@${getNamedPlaceholder<Fields>(field, index)}`
		case BIND_STYLES.NAMED_COLON: return `:${getNamedPlaceholder<Fields>(field, index)}`
		case BIND_STYLES.POSITIONAL_DOLLAR: return `$${index}`
		default: return `?`
	}
}

function getNamedPlaceholder<Fields extends string>(field: Fields | string, index: number): string {
	return `_${index}_${field}`
}

function applyCollectionIfNeeded<Fields extends string, Collections extends string>(props: {
	field: Fields | string,
	collection?: Collections
}) {
	if (props.collection && props.collection.length) {
		return `${props.collection}.${props.field}`
	}

	return props.field
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

function buildComparison<Fields extends string>(
	{
		value,
		caseInsensitive,
		operator
	}: {
		value: Primitive,
		caseInsensitive?: boolean,
		operator: OPERATOR
	},
	{
		column,
		field,
		index
	}: {
		column: string,
		field: Fields | string,
		index: number
	},
	bindStyle: BindStyle
): {
	clause: string,
	params: Record<string, Primitive>[]
} {
	const placeholder = getPlaceholder<Fields>(field, index, bindStyle)
	const clause = `${applyCaseModeIfNeeded({
		expr: column,
		value,
		caseInsensitive
	})} ${OPERATOR[operator]} ${applyCaseModeIfNeeded({
		expr: placeholder,
		value,
		caseInsensitive
	})}`

	return {
		clause,
		params: [
			{
				[getNamedPlaceholder<Fields>(field, index)]: value
			}
		]
	}
}

function buildList<Fields extends string>(
	{
		values,
		caseInsensitive,
		operator
	}: {
		values: Primitive[],
		caseInsensitive?: boolean,
		operator: OPERATOR
	},
	{
		column,
		field,
		index
	}: {
		column: string,
		field: Fields | string,
		index: number
	},
	bindStyle: BindStyle
): {
	clause: string,
	params: Record<string, Primitive>[]
} {
	const params: Record<string, Primitive>[] = []
	const placeholders = values.map(value => {
		const placeholder = getPlaceholder<Fields>(field, index + params.length, bindStyle)

		params.push({
			[getNamedPlaceholder<Fields>(field, index + params.length)]: value
		})

		return applyCaseModeIfNeeded({
			expr: placeholder,
			value,
			caseInsensitive
		})
	})
	const clause = `${applyCaseModeIfNeeded({
		expr: column,
		value: values,
		caseInsensitive: caseInsensitive
	})} ${OPERATOR[operator]} (${placeholders.join(', ')})`

	return {
		clause,
		params
	}
}

function buildMatch<Fields extends string>(
	{
		value,
		caseInsensitive
	}: {
		value: Primitive,
		caseInsensitive?: boolean
	},
	{
		column,
		field,
		index
	}: {
		column: string,
		field: Fields | string,
		index: number
	},
	bindStyle: BindStyle
): {
	clause: string,
	params: Record<string, Primitive>[]
} {
	const placeholder = getPlaceholder<Fields>(field, index, bindStyle)
	const clause = `${applyCaseModeIfNeeded({
		expr: column,
		value,
		caseInsensitive: caseInsensitive
	})} LIKE ${applyCaseModeIfNeeded({
		expr: placeholder,
		value,
		caseInsensitive: caseInsensitive
	})}`

	return {
		clause,
		params: [
			{
				[getNamedPlaceholder<Fields>(field, index)]: value
			}
		]
	}
}

function isCompoundFilter<Fields extends string, Collections extends string>(key: string, value: FilterValue<Fields, Collections>): value is CompoundFilterValue<Fields, Collections> {
	return key in LOGICAL_OPERATOR
}