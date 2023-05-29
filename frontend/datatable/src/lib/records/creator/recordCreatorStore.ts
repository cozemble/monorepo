import type { DataRecord, ModelId, RecordGraph } from '@cozemble/model-core'
import { writable } from 'svelte/store'
import type { EventSourcedRecordGraph } from '@cozemble/model-event-sourced'
import type { RecordGraphModifier } from '@cozemble/data-editor-sdk'

export type NewRecordModifier = (
  graph: RecordGraph,
  record: DataRecord,
) => { record: DataRecord; graph: RecordGraph }

export interface CreateNewRecord {
  modelId: ModelId
  onCreated: (graph: EventSourcedRecordGraph) => void
  onCancel: () => void
  titlePrefix: string
  isRootRecord: boolean
  modifiers: RecordGraphModifier[]
}

export const createNewRecordStore = writable<CreateNewRecord | null>(null)

export function createNewNestedRecord(
  modelId: ModelId,
  titlePrefix = '',
): Promise<EventSourcedRecordGraph | null> {
  return new Promise((resolve) => {
    function onCreated(value: EventSourcedRecordGraph): void {
      if (value.records.length !== 1) {
        throw new Error('Expected exactly one record')
      }
      resolve(value)
    }

    function onCancel(): void {
      resolve(null)
    }

    createNewRecordStore.set({
      modelId,
      onCreated,
      onCancel,
      titlePrefix,
      isRootRecord: false,
      modifiers: [],
    })
  })
}

export function createNewRootRecord(
  modelId: ModelId,
  ...modifiers: RecordGraphModifier[]
): Promise<EventSourcedRecordGraph | null> {
  return new Promise((resolve) => {
    function onCreated(value: EventSourcedRecordGraph): void {
      resolve(value)
    }

    function onCancel(): void {
      resolve(null)
    }

    createNewRecordStore.set({
      modelId,
      onCreated,
      onCancel,
      titlePrefix: '',
      isRootRecord: true,
      modifiers,
    })
  })
}
