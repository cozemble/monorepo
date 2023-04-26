import type { DataRecord, Model, ModelSlot, NestedModel } from '@cozemble/model-core'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { dataRecordFns } from '@cozemble/model-api'

export interface SlotBeingEdited {
  models: EventSourcedModel[]
  model: EventSourcedModel
  slot: ModelSlot
  anchorElement: HTMLElement
}

export function ensureNestedRecords(
  currentUserId: string,
  model: Model,
  record: DataRecord,
  nestedModel: NestedModel,
): DataRecord {
  if (record.values[nestedModel.id.value] === undefined) {
    if (nestedModel.cardinality === 'one') {
      record.values[nestedModel.id.value] = dataRecordFns.newInstance(model, currentUserId)
    } else {
      record.values[nestedModel.id.value] = []
    }
  }
  return record
}
