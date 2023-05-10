import type { ModelId } from '@cozemble/model-core'
import { writable } from 'svelte/store'
import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk'
import type { JustErrorMessage } from '@cozemble/lang-util/dist/esm'

export interface CreateNewRecord {
  modelId: ModelId
  onCreated: (value: EventSourcedDataRecord) => void
  onCancel: () => void
  titlePrefix: string
  isRootRecord: boolean
}

export const createNewRecordStore = writable<CreateNewRecord | null>(null)

// export function createNewNestedRecord(
//   modelId: ModelId,
//   onCreated: (value: EventSourcedDataRecord) => void,
//   onCancel: () => void,
//   titlePrefix = '',
// ): Promise<DataRecord | null> {
//   return new Promise((resolve) => {
//     function onCreated(value: EventSourcedDataRecord): void {
//       resolve(value)
//     }
//
//     function onCancel(): void {
//       resolve(null)
//     }
//
//     createNewRecordStore.set({ modelId, onCreated, onCancel, titlePrefix, isRootRecord: false })
//   })
// }

export function createNewRootRecord(modelId: ModelId): Promise<EventSourcedDataRecord | null> {
  return new Promise((resolve) => {
    function onCreated(value: EventSourcedDataRecord): void {
      resolve(value)
    }

    function onCancel(): void {
      resolve(null)
    }

    createNewRecordStore.set({ modelId, onCreated, onCancel, titlePrefix: '', isRootRecord: true })
  })
}
