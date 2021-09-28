export function toArray<T>(item: T | T[]): T[] {
  return Array.isArray(item) ? item : [item]
}

export function generateQueryPlaceholders(
  length: number,
  startingIndex = 1
): string {
  const arr = Array.from({ length }, (_, index) => `$${index + startingIndex}`)
  return arr.join(', ')
}

/* Generates a string that helps you insert many rows at once in postgres
 * It will be of format:
 *  ($1, $2, $3),
 *  ($4, $5, $6),
 *  ...($3n + 1, $3n + 2, $3n + 3)
 *  Where n = num of rows, numElementsPerRow = 3 for this example
 * */
export function insertMultiRowPlaceholder(
  numRows: number,
  numElementsPerRow: number
): string {
  const arr = Array.from(
    { length: numRows },
    (_, index) =>
      `(${generateQueryPlaceholders(
        numElementsPerRow,
        index * numElementsPerRow + 1
      )})`
  )
  const value = arr.join(',\n')
  return `${value} `
}

export function getFirstElement<T>(val: T[] | T): T | undefined {
  return Array.isArray(val) ? val[0] : val
}

export function parseQueryObj<T = NodeJS.Dict<string>>(
  queryObj: NodeJS.Dict<string | string[]>
): T {
  const parsedObj = {} as T
  for (const [key, value] of Object.entries(queryObj)) {
    parsedObj[key] = getFirstElement(value)
  }
  return parsedObj
}

// Obj Validation helpers
type ValidateObjErrHandler = (missingFields: string[]) => void

const defaultValidationFn: ValidateObjErrHandler = (missingFields) => {
  throw new Error(
    `Invalid request. Required fields: ${missingFields
      .map((field) => `'${field}'`)
      .join(', ')}`
  )
}
export function validateObj<T>(
  obj: Partial<T>,
  requiredParams: keyof T | (keyof T)[],
  errHandler: ValidateObjErrHandler = defaultValidationFn
): T {
  const requiredFields = toArray(requiredParams)
  const missingFields = getMissingFields(obj, requiredFields)
  if (missingFields.length) errHandler(missingFields)
  return obj as T
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function getMissingFields<T extends {}>(
  obj: Partial<T>,
  requiredParams: (keyof T)[]
): string[] {
  const missingFields = requiredParams.reduce(
    (missing, key) => (obj[key] == undefined ? [...missing, key] : missing),
    []
  )
  return missingFields.length ? missingFields : []
}
