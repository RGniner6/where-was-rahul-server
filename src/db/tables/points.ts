import { ClientType } from '../postgresHandler'
import { insertMultiRowPlaceholder, toArray } from '../../utils/utils'
import { PathTableRow } from './paths'

export type PointsTableRow = {
  start_time: Date
  end_time: Date
  coordinates: [number, number]
  name: string
  category: string | null
}

const columns: (keyof PointsTableRow)[] = [
  'start_time',
  'end_time',
  'coordinates',
  'name',
  'category',
]

export async function addNewPoint(
  client: ClientType,
  newPoint: PointsTableRow | PointsTableRow[]
) {
  const points = toArray(newPoint)
  const query = `
  INSERT INTO where_was_rahul.points (${columns
    .map((col) => `"${col}"`)
    .join(', ')}) 
    VALUES
        ${insertMultiRowPlaceholder(points.length, 5)}
    ON CONFLICT ON CONSTRAINT unique_point_start_time DO NOTHING 
    RETURNING *
  `
  const pointToValArr = (point: PointsTableRow) =>
    columns.map((col) => point[col])
  const values = points.reduce(
    (acc, curr) => [...acc, ...pointToValArr(curr)],
    []
  )
  const { rows } = await client.query(query, values)
  return rows
}
