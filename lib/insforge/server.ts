import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return client
}

interface QueryResult<T = Record<string, unknown>[]> {
  data: T | null
  error: { message: string; code?: string } | null
}

type OperationType = 'select' | 'insert' | 'update' | 'delete'

class QueryBuilder implements PromiseLike<QueryResult> {
  private _table: string
  private _operation: OperationType = 'select'
  private _selectColumns = '*'
  private _conditions: { column: string; value: unknown; isIn?: boolean }[] = []
  private _limitCount = 100
  private _isSingle = false
  private _orderBy: { column: string; ascending: boolean } | null = null
  private _insertData: Record<string, unknown> | Record<string, unknown>[] | null = null
  private _updateData: Record<string, unknown> | null = null
  private _wantsReturning = false

  constructor(table: string) {
    this._table = table
  }

  select(columns = '*'): this {
    if (this._operation === 'select') {
      this._selectColumns = columns
    } else {
      this._wantsReturning = true
      this._selectColumns = columns
    }
    return this
  }

  eq(column: string, value: unknown): this {
    this._conditions.push({ column, value })
    return this
  }

  in(column: string, values: unknown[]): this {
    this._conditions.push({ column, value: values, isIn: true })
    return this
  }

  limit(count: number): this {
    this._limitCount = count
    return this
  }

  order(column: string, options?: { ascending?: boolean }): this {
    this._orderBy = { column, ascending: options?.ascending ?? true }
    return this
  }

  single(): this {
    this._isSingle = true
    return this
  }

  insert(data: Record<string, unknown> | Record<string, unknown>[]): this {
    this._operation = 'insert'
    this._insertData = data
    return this
  }

  update(data: Record<string, unknown>): this {
    this._operation = 'update'
    this._updateData = data
    return this
  }

  delete(): this {
    this._operation = 'delete'
    return this
  }

  private async _execute(): Promise<QueryResult> {
    try {
      const sb = getClient()

      switch (this._operation) {
        case 'select': {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let q: any = sb.from(this._table).select(this._selectColumns)

          for (const cond of this._conditions) {
            if (cond.isIn) {
              q = q.in(cond.column, cond.value as unknown[])
            } else {
              q = q.eq(cond.column, cond.value)
            }
          }

          if (this._orderBy) {
            q = q.order(this._orderBy.column, { ascending: this._orderBy.ascending })
          }

          q = q.limit(this._limitCount)

          if (this._isSingle) q = q.single()

          const result = await q
          return { data: result.data, error: result.error }
        }

        case 'insert': {
          const raw = this._insertData as Record<string, unknown> | Record<string, unknown>[] | null
          const records = (Array.isArray(raw) ? raw.filter((r): r is Record<string, unknown> => r !== null) : raw ? [raw] : []) as Record<string, unknown>[]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let q: any = sb.from(this._table).insert(records)

          if (this._wantsReturning) {
            q = q.select(this._selectColumns)
          }
          if (this._isSingle) {
            q = q.single()
          }

          const result = await q
          return { data: result.data, error: result.error }
        }

        case 'update': {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let q: any = sb.from(this._table).update(this._updateData!)

          for (const cond of this._conditions) {
            q = q.eq(cond.column, cond.value)
          }

          q = q.select(this._selectColumns)

          if (this._isSingle) {
            q = q.single()
          }

          const result = await q
          return { data: result.data, error: result.error }
        }

        case 'delete': {
          let q = sb.from(this._table).delete()

          for (const cond of this._conditions) {
            q = q.eq(cond.column, cond.value)
          }

          const result = await q
          if (result.error) {
            return { data: null, error: result.error }
          }
          return { data: result.data, error: null }
        }

        default:
          return { data: null, error: { message: 'Unknown operation' } }
      }
    } catch (error) {
      return {
        data: null,
        error: { message: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this._execute().then(onfulfilled, onrejected)
  }
}

export class DBClient {
  from(table: string) {
    return new QueryBuilder(table)
  }

  async query(sql: string, _params?: unknown[]): Promise<QueryResult> {
    try {
      const sb = getClient()

      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const match = sql.match(/FROM\s+(\w+)/i)
        if (match) {
          const tableName = match[1]
          const { data, error } = await sb.from(tableName).select('*').limit(5)
          return { data, error: error ? { message: error.message, code: error.code } : null }
        }
      }

      const { data, error } = await sb.from('users').select('id').limit(1)
      return { data, error: error ? { message: error.message, code: error.code } : null }
    } catch (error) {
      return {
        data: null,
        error: { message: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }
}

export function getDBPool() {
  return { getClient }
}
