export type JsonPath = string[]

export interface SavableRecord {
  id: { value: string }
  modelId: { value: string }
  values: { [key: string]: any }
}

export interface SavableRecords {
  _type: 'savable.records'
  uniquePaths: JsonPath[]
  records: SavableRecord[]
}

export function savableRecords(
  records: SavableRecord[],
  uniquePaths: JsonPath[] = [],
): SavableRecords {
  return {
    _type: 'savable.records',
    uniquePaths,
    records,
  }
}
