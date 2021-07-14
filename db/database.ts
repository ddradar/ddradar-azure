import type {
  ItemDefinition,
  JSONValue,
  Resource,
  SqlParameter,
} from '@azure/cosmos'
import { Container, CosmosClient } from '@azure/cosmos'
import type { Database } from '@ddradar/core'

// eslint-disable-next-line node/no-process-env
const connectionString = process.env.COSMOS_DB_CONN

/** Returns Cosmos DB connection string is defined or not. */
export function canConnectDB(): boolean {
  return !!connectionString
}

//#region DB Container - Schema mapping
type ContainerName =
  | 'Scores'
  | 'Songs'
  | 'Users'
  | 'Notification'
  | 'UserDetails'

type ContainerValue<T> = T extends 'Scores'
  ? Database.ScoreSchema
  : T extends 'Songs'
  ? Database.SongSchema | Database.CourseSchema
  : T extends 'Users'
  ? Database.UserSchema
  : T extends 'Notification'
  ? Database.NotificationSchema
  : T extends 'UserDetails'
  ?
      | Database.ClearStatusSchema
      | Database.GrooveRadarSchema
      | Database.ScoreStatusSchema
  : never

type DbItem<T> = ContainerValue<T> & Pick<ItemDefinition, 'ttl'> & Resource
//#endregion

/** Global instance to connect to Cosmos DB */
let client: CosmosClient
/** Global instances to access DB container */
const containers: Partial<Record<ContainerName, Container>> = {}

/** Get or create DB container. */
export function getContainer(id: ContainerName): Container {
  if (!client) client = new CosmosClient(connectionString ?? '')
  return (
    containers[id] ??
    (containers[id] = client.database('DDRadar').container(id))
  )
}

/** SQL WHERE condition */
export type Condition = {
  /**
   * WHERE condition.
   * `"@"` replaces to `"@paramXX"`.
   */
  condition: string
  /** Parameter value */
  value?: JSONValue
}

/**
 * Calls SQL and returns TOP 1 object from Container
 * @param containerName Container name
 * @param columns Columns
 * @param conditions SQL WHERE conditions
 */
export async function fetchOne<
  T extends ContainerName,
  U extends keyof DbItem<T>
>(
  containerName: T,
  columns: readonly U[],
  ...conditions: readonly Condition[]
): Promise<Pick<DbItem<T>, U> | null> {
  // Create SQL statement
  const column = columns.map(col => `c.${col}`).join(',')
  const { condition, parameters } = createConditions(conditions)
  const query = `SELECT ${column} FROM c WHERE ${condition}`

  const container = getContainer(containerName)
  const { resources } = await container.items
    .query<Pick<DbItem<T>, U>>({ query, parameters })
    .fetchNext()
  return resources[0] ?? null
}

/**
 * Calls SQL and returns list data from Container
 * @param containerName Container name
 * @param columns Columns
 * @param conditions SQL WHERE conditions
 * @param orderBy Sort order
 */
export async function fetchList<T extends ContainerName>(
  containerName: T,
  columns: '*',
  conditions: readonly Condition[],
  orderBy: Partial<Record<keyof DbItem<T>, 'ASC' | 'DESC'>>
): Promise<DbItem<T>[]>

/**
 * Calls SQL and returns list data from Container
 * @param containerName Container name
 * @param columns Columns
 * @param conditions SQL WHERE conditions
 * @param orderBy Sort order
 */
export async function fetchList<
  T extends ContainerName,
  U extends keyof DbItem<T>
>(
  containerName: T,
  columns: readonly U[],
  conditions: readonly Condition[],
  orderBy: Partial<Record<keyof DbItem<T>, 'ASC' | 'DESC'>>
): Promise<Pick<DbItem<T>, U>[]>

export async function fetchList<
  T extends ContainerName,
  U extends keyof DbItem<T>
>(
  containerName: T,
  columns: readonly U[] | '*',
  conditions: readonly Condition[],
  orderBy: Partial<Record<U, 'ASC' | 'DESC'>>
): Promise<Pick<DbItem<T>, U>[]> {
  // Create SQL statement
  const column =
    typeof columns === 'string'
      ? columns
      : columns.map(col => `c.${col}`).join(',')
  const { condition, parameters } = createConditions(conditions)

  const order = Object.entries(orderBy)
    .map(([c, a]) => `c.${c} ${a}`)
    .join(', ')
  const sql = `SELECT ${column} FROM c WHERE ${condition} ORDER BY ${order}`

  const container = getContainer(containerName)
  const { resources } = await container.items
    .query<Pick<DbItem<T>, U>>({ query: sql, parameters })
    .fetchAll()
  return resources
}

/**
 * Calls GROUP BY SQL and returns list data from Container
 * @param containerName Container name
 * @param columns Columns
 * @param conditions SQL WHERE conditions
 * @param groupBy GROUP BY
 */
export async function fetchGroupedList<T extends ContainerName, U>(
  containerName: T,
  columns: readonly (
    | Extract<keyof U, string>
    | `${string} AS ${Extract<keyof U, string>}`
  )[],
  conditions: readonly Condition[],
  groupBy: readonly (keyof DbItem<T>)[]
): Promise<U[]> {
  const column = columns
    .map(col =>
      typeof col === 'string' && col.includes(' AS ') ? col : `c.${col}`
    )
    .join(',')
  const group = groupBy.map(col => `c.${col}`).join(',')
  const { condition, parameters } = createConditions(conditions)
  const sql = `SELECT ${column} FROM c WHERE ${condition} GROUP BY ${group}`

  const container = getContainer(containerName)
  const { resources } = await container.items
    .query<U>({ query: sql, parameters })
    .fetchAll()
  return resources
}

function createConditions(conditions: readonly Condition[]) {
  return {
    condition: conditions
      .map((c, i) => c.condition.replace('@', `@param${i}`))
      .join(' AND '),
    parameters: conditions
      .map((c, i) => ({ name: `@param${i}`, value: c.value }))
      .filter((c): c is SqlParameter => c.value !== undefined),
  }
}
