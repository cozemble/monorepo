export interface ConflictErrorType {
  _type: 'error.conflict'
  conflictingRecordId: string
  conflictingModelId: string
  conflictingPath: string
}

export type ErrorType = ConflictErrorType
