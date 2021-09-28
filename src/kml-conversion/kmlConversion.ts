import {
  Feature,
  KmlToJson,
  LineFeature,
  PointFeature,
} from '../models/kml.model'
import { addNewPath, PathTableRow } from '../db/tables/paths'
import { addNewPoint, PointsTableRow } from '../db/tables/points'
import { join } from 'path'
import { readdir } from 'fs-extra'
import { getPool } from '../db/postgresHandler'
import parseKML from 'parse-kml'
import { SRC_ROOT_PATH } from '../server'

export const lineFeatureToPath = (lineFeature: LineFeature): PathTableRow => {
  const { geometry, properties } = lineFeature
  const coordinates = geometry.coordinates.map((coordinate): [
    number,
    number
  ] => [numberToE7(coordinate[0]), numberToE7(coordinate[1])])
  return {
    start_time: new Date(properties.timespan.begin),
    end_time: new Date(properties.timespan.end),
    coordinates,
    activity_type: properties.Category,
    distance: Number(properties.Distance) || null,
  }
}

export const pointFeatureToPoint = (
  pointFeature: PointFeature
): PointsTableRow => {
  const { geometry, properties } = pointFeature
  const coordinate = geometry.coordinates
  const coordinates: [number, number] = [
    numberToE7(coordinate[0]),
    numberToE7(coordinate[1]),
  ]
  return {
    start_time: new Date(properties.timespan.begin),
    end_time: new Date(properties.timespan.end),
    coordinates,
    name: properties.name,
    category: properties.Category || null,
  }
}

const numberToE7 = (num: number) => Math.round(num * 10 ** 7)

export const isPointFeature = (feature: Feature): feature is PointFeature =>
  feature.geometry.type === 'Point'
export const getPointsAndPathsFromKMLs = async (): Promise<{
  paths: PathTableRow[]
  points: PointsTableRow[]
}> => {
  const kmlFilesDir = join(SRC_ROOT_PATH, 'kml-files')
  const dirs = await readdir(kmlFilesDir)
  const paths: PathTableRow[] = []
  const points: PointsTableRow[] = []
  const processFilesPromises = dirs.map(async (fileName) => {
    const fullFilePath = join(kmlFilesDir, fileName)
    const kmlObj = await parseKmlToObj(fullFilePath)
    kmlObj.features.forEach((feature) => {
      if (isPointFeature(feature)) {
        const point = pointFeatureToPoint(feature)
        points.push(point)
      } else {
        const path = lineFeatureToPath(feature)
        paths.push(path)
      }
    })
  })
  await Promise.all(processFilesPromises)
  return {
    paths,
    points,
  }
}
export const insertPathsAndPointsIntoDB = async (
  paths: PathTableRow[],
  points: PointsTableRow[]
) => {
  const pool = await getPool()
  return Promise.all([addNewPath(pool, paths), addNewPoint(pool, points)])
}
export const parseKmlToObj = async (filePath: string): Promise<KmlToJson> =>
  parseKML.toJson(filePath)
