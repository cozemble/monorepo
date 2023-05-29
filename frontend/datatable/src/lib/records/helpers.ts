import type { DataRecordValuePath, ModelSlot } from '@cozemble/model-core'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { dataRecordValuePathFns } from '@cozemble/model-api'
import type { EventSourcedModelList } from '@cozemble/model-event-sourced'
import type { Writable } from 'svelte/store'

export interface SlotBeingEdited {
  modelList: Writable<EventSourcedModelList>
  model: EventSourcedModel
  slot: ModelSlot
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
