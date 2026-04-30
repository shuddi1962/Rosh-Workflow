export interface QueryResult<T = unknown[]> {
  data: T | null
  error: { message: string; code?: string } | null
}

export interface QueryBuilder {
  select(columns?: string): QueryBuilder
  eq(column: string, value: unknown): QueryBuilder
  in(column: string, values: unknown[]): QueryBuilder
  limit(count: number): QueryBuilder
  order(column: string, options?: { ascending?: boolean }): QueryBuilder
  single(): QueryBuilder
  insert(data: Record<string, unknown>): QueryBuilder
  update(data: Record<string, unknown>): QueryBuilder
  delete(): QueryBuilder
}

export interface DBClient {
  from(table: string): QueryBuilder
  query(sql: string, params?: unknown[]): Promise<QueryResult>
}

const errorResult: QueryResult = {
  data: null,
  error: { message: 'Database operations can only be performed on the server' }
}

class QueryBuilderStub implements QueryBuilder {
  select() { return this }
  eq() { return this }
  in() { return this }
  limit() { return this }
  order() { return this }
  single() { return this }
  insert() { return this }
  update() { return this }
  delete() { return this }
  async then(onfulfilled: (value: QueryResult) => unknown) {
    return onfulfilled(errorResult)
  }
}

class DBClientStub implements DBClient {
  from(): QueryBuilder { return new QueryBuilderStub() }
  async query() { return errorResult }
}

export const insforge: DBClient = new DBClientStub()
export const insforgeAdmin: DBClient = new DBClientStub()
