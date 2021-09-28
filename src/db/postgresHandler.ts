import { Client, ClientBase, Pool, PoolClient, PoolConfig } from 'pg'

/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

export type CustomClient = PoolClient & { lastQuery?: any[] }

let pool: Pool
export const getPool = async () => {
  if (pool) return pool
  const dbConfig: PoolConfig = {
    user: 'rahul',
    password: 'dontknow96',
    host: 'localhost',
    database: 'whereWasRahul',
    port: 5432,
  }
  pool = new Pool(dbConfig)
  return pool
}

/**
 * Checks out a client from a db pool
 * @param pool
 */
export const getClientFromPool = async (pool: Pool): Promise<CustomClient> => {
  const client: CustomClient = await pool.connect()
  const query = client.query
  const release = client.release
  // set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error(
      'WARNING: A client has been checked out for more than 5 seconds!'
    )
    console.error(
      `The last executed query on this client was: ${client.lastQuery}`
    )
  }, 5000)
  // monkey patch the query method to keep track of the last query executed
  client.query = (...args) => {
    client.lastQuery = args
    return query.apply(client, args)
  }
  client.release = () => {
    // clear our timeout
    clearTimeout(timeout)
    // set the methods back to their old un-monkey-patched version
    client.query = query
    client.release = release
    return release.apply(client)
  }
  return client
}

export type ClientType = Client | CustomClient | Pool

/**
 * Executes a query using a specified postgres client,
 * The client should be already connected to the database or this will not work
 * NOTE: GENERIC TYPE IS MERELY FOR CONVENIENCE. RETURN TYPE NOT GUARANTEED
 */
export async function executeQuery<
  R extends any[] = any[],
  I extends any[] = any[]
>(client: ClientType, query: string, values: I, mode?: 'array'): Promise<R[]>
/**
 * Executes a query using a specified postgres client,
 * The client should be already connected to the database or this will not work
 * NOTE: GENERIC TYPE IS MERELY FOR CONVENIENCE. RETURN TYPE NOT GUARANTEED
 */
export async function executeQuery<R extends {}, I extends any[] = any[]>(
  client: ClientType,
  query: string,
  values: I,
  mode?: 'object'
): Promise<R[]>
export async function executeQuery<R, I extends any[] = any[]>(
  client: ClientType,
  query: string,
  values: I,
  mode: 'array' | 'object' = 'array'
): Promise<any> {
  const rowMode = mode === 'array' ? mode : undefined
  const response = await client.query({ rowMode, text: query, values: values })
  return response.rows as unknown as R[]
}

export type TransactionStage = 'BEGIN' | 'COMMIT' | 'ROLLBACK'
export async function setTransactionStage(
  clients: ClientBase | ClientBase[],
  stage: TransactionStage
): Promise<void> {
  const clientArr = Array.isArray(clients) ? clients : [clients]
  await Promise.all(clientArr.map(async (client) => await client.query(stage)))
}

export const startTransaction = (
  clients: ClientBase | ClientBase[]
): Promise<void> => setTransactionStage(clients, 'BEGIN')
export const commitTransaction = (
  clients: ClientBase | ClientBase[]
): Promise<void> => setTransactionStage(clients, 'COMMIT')
export const rollbackTransaction = (
  clients: ClientBase | ClientBase[]
): Promise<void> => setTransactionStage(clients, 'ROLLBACK')

export interface QueryFormat {
  query: string
  value: any[]
}
