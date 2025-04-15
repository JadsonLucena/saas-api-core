export const MAX_TAKE = 50 as const

/*export type OffsetPagination<N extends number = typeof MAX_TAKE> = Pagination<N> & {
  skip?: number
}

export type CursorPagination<N extends number = typeof MAX_TAKE> = Pagination<N> & {
  cursor?: string
}

type Pagination<N extends number = typeof MAX_TAKE> = {
  take?: Take<N>
}

type Take<N extends number, Acc extends number[] = [1]> = Acc['length'] extends N ? [...Acc, Acc['length']][number] : Take<N, [...Acc, Acc['length']]>
*/

export type OffsetPagination = Pagination & {
  skip?: number
}

export type CursorPagination = Pagination & {
  cursor?: string
}

type Pagination = {
  take?: number
}