export interface DataRecordsTableOptions {
  permitSubItemAddition: boolean
  permitModelEditing: boolean
  showActions: boolean
}

export function dataRecordsTableOptions(
  permitSubItemAddition: boolean,
  permitModelEditing: boolean,
  showActions: boolean,
): DataRecordsTableOptions {
  return {
    permitSubItemAddition,
    permitModelEditing,
    showActions,
  }
}
