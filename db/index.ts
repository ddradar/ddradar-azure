import type { ItemDefinition, JSONValue, SqlParameter } from '@azure/cosmos'
import { Container, CosmosClient } from '@azure/cosmos'
import type { Database } from '@ddradar/core'

// eslint-disable-next-line node/no-process-env
const connectionString = process.env.COSMOS_DB_CONN

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

type DbItem<T> = Partial<ContainerValue<T> & ItemDefinition & { _ts: number }>
//#endregion

let client: CosmosClient
const containers: Partial<Record<ContainerName, Container>> = {}

export function getContainer(id: ContainerName): Container {
  if (!client) client = new CosmosClient(connectionString ?? '')
  return (
    containers[id] ??
    (containers[id] = client.database('DDRadar').container(id))
  )
}

export type Condition = {
  condition: string
  value?: JSONValue
}

export async function fetchOne<T extends ContainerName, U extends DbItem<T>>(
  containerName: T,
  columns: readonly (keyof U)[],
  conditions: readonly Condition[]
): Promise<U | null> {
  // Create SQL statement
  const column = columns.map(col => `c.${col}`).join(', ')
  const condition = conditions
    .map((c, i) => c.condition.replace('@', `@param${i}`))
    .join(' AND ')
  const parameters = conditions
    .map((c, i) => ({ name: `@param${i}`, value: c.value }))
    .filter((c): c is SqlParameter => c.value !== undefined)
  const query = `SELECT ${column} FROM c WHERE ${condition}`

  const container = getContainer(containerName)
  const { resources } = await container.items
    .query<U>({ query, parameters })
    .fetchNext()
  return resources[0] ?? null
}

export async function fetchList<T extends ContainerName, U extends DbItem<T>>(
  containerName: T,
  columns: readonly (keyof U)[],
  conditions: readonly Condition[],
  orderBy: Partial<Record<keyof U, 'ASC' | 'DESC'>>
): Promise<U[]> {
  // Create SQL statement
  const column = columns.map(col => `c.${col}`).join(', ')
  const condition = conditions
    .map((c, i) => c.condition.replace('@', `@param${i}`))
    .join(' AND ')
  const parameters = conditions
    .map((c, i) => ({ name: `@param${i}`, value: c.value }))
    .filter((c): c is SqlParameter => c.value !== undefined)
  const order = Object.entries(orderBy)
    .map(([c, a]) => `c.${c} ${a}`)
    .join(', ')
  const sql = `SELECT ${column} FROM c WHERE ${condition} ORDER BY ${order}`

  const container = getContainer(containerName)
  const { resources } = await container.items
    .query<U>({ query: sql, parameters })
    .fetchAll()
  return resources
}

export * from './scores'
export * from './songs'
export * from './user-details'
export * from './users'
