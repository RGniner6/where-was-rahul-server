type ActivityType =
  | 'Cycling'
  | 'On a tram'
  | 'On a train'
  | 'Walking'
  | 'On a bus'
  | 'Driving'
  | 'On the subway'
  | 'Running'
  | 'On a ferry'
  | 'Moving'
type GeometryType = 'Point' | 'LineString'
type Coordinate = [number, number, number]

export type Geometry = {
  type: GeometryType
  coordinates: Coordinate | Coordinate[]
}

export type Properties = {
  description: string
  timespan: {
    begin: string
    end: string
  }
  Email: string
}

export interface PointProperty extends Properties {
  name: string
  Distance: '0'
  Category: string
}

export interface LineProperty extends Properties {
  name: ActivityType
  Distance: string
  Category: ActivityType
}

export type PointFeature = {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: Coordinate
  }
  properties: PointProperty
}

export type LineFeature = {
  type: 'Feature'
  geometry: {
    type: 'LineString'
    coordinates: Coordinate[]
  }
  properties: LineProperty
}

export type Feature = PointFeature | LineFeature

export type KmlToJson = {
  type: 'FeatureCollection'
  features: Feature[]
}
