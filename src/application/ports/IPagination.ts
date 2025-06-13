export type OffsetPagination = Pagination & {
  page?: number
}

export type CursorPagination = Pagination & {
  cursor?: string
}

type Pagination = {
  perPage?: number
}