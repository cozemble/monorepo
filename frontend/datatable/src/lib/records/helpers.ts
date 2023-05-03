import type { DataRecord, DataRecordValuePath, Model, ModelSlot } from '@cozemble/model-core'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { dataRecordValuePathFns } from '@cozemble/model-api'

export interface SlotBeingEdited {
  models: EventSourcedModel[]
  model: EventSourcedModel
  slot: ModelSlot
  anchorElement: HTMLElement
}

export interface RecordBeingAdded {
  models: Model[]
  model: Model
  anchorElement: HTMLElement
}

export interface RecordBeingEdited {
  record: DataRecord
  models: Model[]
  model: Model
  anchorElement: HTMLElement
}

export type RecordErrorMap = Map<DataRecordValuePath, string[]>
export type ErrorVisibilityByRecordId = Map<string, boolean>

export function firstRecordError(errors: RecordErrorMap, path: DataRecordValuePath): string | null {
  const maybeKey = Array.from(errors.keys()).find((p) =>
    dataRecordValuePathFns.sameDottedPaths(p, path),
  )
  if (maybeKey) {
    return errors.get(maybeKey)![0]
  }
  return null
}
