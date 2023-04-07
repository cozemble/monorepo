export interface ConflictErrorType {
  _type: 'error.conflict'
  conflictingRecordId: string
  conflictingPath: string
}

export type ErrorType = ConflictErrorType
