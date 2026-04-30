import { Pool } from 'pg'

let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || '8cftq4jt.us-east.database.insforge.app',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'insforge',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: { rejectUnauthorized: false },
      max: 10
    })
  }
  return pool
}

interface QueryResult<T = Record<string, unknown>[]> {
  data: T | null
  error: { message: string; code?: string } | null
}

type OperationType = 'select' | 'insert' | 'update' | 'delete'

export class DBClient {
  from(table: string) {
    return new QueryBuilder(table)
  }

  async query(sql: string, params?: unknown[]): Promise<QueryResult> {
    try {
      const result = await getPool().query(sql, params)
      return { data: result.rows, error: null }
    } catch (error) {
      return {
        data: null,
        error: { message: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }
}

class QueryBuilder implements PromiseLike<QueryResult> {
  private table: string
  private conditions: { column: string; value: unknown; isIn?: boolean }[] = []
  private selectColumns = '*'
  private limitCount = 100
  private isSingle = false
  private orderBy: { column: string; ascending: boolean } | null = null
  private operation: OperationType = 'select'
  private insertData: Record<string, unknown> | Record<string, unknown>[] | null = null
  private updateData: Record<string, unknown> | null = null

  constructor(table: string) {
    this.table = table
  }

  select(columns = '*'): QueryBuilder {
    this.selectColumns = columns
    this.operation = 'select'
    return this
  }

  eq(column: string, value: unknown): QueryBuilder {
    this.conditions.push({ column, value })
    return this
  }

  in(column: string, values: unknown[]): QueryBuilder {
    this.conditions.push({ column, value: values, isIn: true })
    return this
  }

  limit(count: number): QueryBuilder {
    this.limitCount = count
    return this
  }

  order(column: string, options?: { ascending?: boolean }): QueryBuilder {
    this.orderBy = { column, ascending: options?.ascending ?? true }
    return this
  }

  single(): QueryBuilder {
    this.isSingle = true
    return this
  }

  insert(data: Record<string, unknown> | Record<string, unknown>[]): QueryBuilder {
    this.operation = 'insert'
    this.insertData = data
    return this
  }

  update(data: Record<string, unknown>): QueryBuilder {
    this.operation = 'update'
    this.updateData = data
    return this
  }

  delete(): QueryBuilder {
    this.operation = 'delete'
    return this
  }

  private async execute(): Promise<QueryResult> {
    switch (this.operation) {
      case 'select': {
        let paramIndex = 1
        const whereParts: string[] = []
        const whereValues: unknown[] = []
        
        for (const cond of this.conditions) {
          if (cond.isIn) {
            const values = cond.value as unknown[]
            const placeholders = values.map(() => `$${paramIndex++}`).join(', ')
            whereParts.push(`${cond.column} IN (${placeholders})`)
            whereValues.push(...values)
          } else {
            whereParts.push(`${cond.column} = $${paramIndex++}`)
            whereValues.push(cond.value)
          }
        }
        
        let sql = `SELECT ${this.selectColumns} FROM ${this.table}`
        if (whereParts.length > 0) {
          sql += ` WHERE ${whereParts.join(' AND ')}`
        }
        if (this.orderBy) {
          sql += ` ORDER BY ${this.orderBy.column} ${this.orderBy.ascending ? 'ASC' : 'DESC'}`
        }
        sql += ` LIMIT ${this.limitCount}`
        
        try {
          const result = await getPool().query(sql, whereValues)
          if (this.isSingle) {
            return { data: result.rows[0] || null, error: null }
          }
          return { data: result.rows, error: null }
        } catch (error) {
          return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } }
        }
      }
      
      case 'insert': {
        if (!this.insertData) return { data: null, error: { message: 'No data to insert' } }
        
        const records = Array.isArray(this.insertData) ? this.insertData : [this.insertData]
        if (records.length === 0) return { data: null, error: { message: 'No data to insert' } }
        
        const columns = Object.keys(records[0])
        const placeholders = records.map((_, rowIdx) => 
          `(${columns.map((_, colIdx) => `$${rowIdx * columns.length + colIdx + 1}`).join(', ')})`
        ).join(', ')
        const values = records.flatMap(r => columns.map(c => r[c]))
        const sql = `INSERT INTO ${this.table} (${columns.join(', ')}) VALUES ${placeholders} RETURNING *`
        
        try {
          const result = await getPool().query(sql, values)
          return { data: result.rows.length === 1 ? result.rows[0] : result.rows, error: null }
        } catch (error) {
          return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } }
        }
      }
      
      case 'update': {
        if (!this.updateData) return { data: null, error: { message: 'No data to update' } }
        const setColumns = Object.keys(this.updateData)
        const setValues = Object.values(this.updateData)
        const setClause = setColumns.map((col, i) => `${col} = $${i + 1}`).join(', ')
        const whereConditions = this.conditions.map((cond, i) => `${cond.column} = $${setValues.length + i + 1}`)
        const whereValues = this.conditions.map(c => c.value)
        const sql = `UPDATE ${this.table} SET ${setClause} WHERE ${whereConditions.join(' AND ')} RETURNING *`
        const params = [...setValues, ...whereValues]
        
        try {
          const result = await getPool().query(sql, params)
          return { data: result.rows[0] || null, error: null }
        } catch (error) {
          return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } }
        }
      }
      
      case 'delete': {
        const whereConditions = this.conditions.map((cond, i) => `${cond.column} = $${i + 1}`)
        const whereValues = this.conditions.map(c => c.value)
        const sql = `DELETE FROM ${this.table} WHERE ${whereConditions.join(' AND ')} RETURNING *`
        
        try {
          const result = await getPool().query(sql, whereValues)
          return { data: result.rows[0] || null, error: null }
        } catch (error) {
          return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } }
        }
      }
      
      default:
        return { data: null, error: { message: 'Unknown operation' } }
    }
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected)
  }
}

export function getDBPool(): Pool {
  return getPool()
}
