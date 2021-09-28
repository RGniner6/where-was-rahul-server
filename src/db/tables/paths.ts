import { ClientType, getPool } from '../postgresHandler'
import { insertMultiRowPlaceholder, toArray } from '../../utils/utils'

export const getAllPaths = async () => {
  const pool = await getPool()
  const query = `
  SELECT * FROM where_was_rahul.paths
  `
  const { rows } = await pool.query(query, [])
}

export type PathTableRow = {
  start_time: Date
  end_time: Date
  coordinates: [number, number][]
  activity_type: string
  distance: number
}
export const addNewPath = async (
  client: ClientType,
  newPath: PathTableRow | PathTableRow[]
) => {
  const paths = toArray(newPath)
  const columns: (keyof PathTableRow)[] = [
    'start_time',
    'end_time',
    'coordinates',
    'activity_type',
    'distance',
  ]
  const query = `
  INSERT INTO where_was_rahul.paths (${columns
    .map((col) => `"${col}"`)
    .join(', ')}) 
    VALUES
        ${insertMultiRowPlaceholder(paths.length, 5)}
    ON CONFLICT ON CONSTRAINT unique_path_start_time DO NOTHING 
    RETURNING *
  `
  const pathToValArr = (path: PathTableRow) => columns.map((col) => path[col])
  const values = paths.reduce(
    (acc, curr) => [...acc, ...pathToValArr(curr)],
    []
  )
  const { rows } = await client.query(query, values)
  return rows
}
