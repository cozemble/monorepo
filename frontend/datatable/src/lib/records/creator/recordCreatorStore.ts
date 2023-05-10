import type { DataRecord, ModelId } from '@cozemble/model-core'
import { writable } from 'svelte/store'

export interface CreateNewRecord {
  modelId: ModelId
  onCreated: (value: DataRecord) => void
  onCancel: () => void
  titlePrefix: string
  isRootRecord: boolean
}

export const createNewRecordStore = writable<CreateNewRecord | null>(null)

export function createNewNestedRecord(
  modelId: ModelId,
  onCreated: (value: DataRecord) => void,
  onCancel: () => void,
  titlePrefix = '',
): Promise<DataRecord | null> {
  return new Promise((resolve) => {
    function onCreated(value: DataRecord): void {
      resolve(value)
    }

    function onCancel(): void {
      resolve(null)
    }

    createNewRecordStore.set({ modelId, onCreated, onCancel, titlePrefix, isRootRecord: false })
  })
}

export function createNewRootRecord(modelId: ModelId): Promise<DataRecord | null> {
  return new Promise((resolve) => {
    function onCreated(value: DataRecord): void {
      resolve(value)
    }

    function onCancel(): void {
      resolve(null)
    }

    createNewRecordStore.set({ modelId, onCreated, onCancel, titlePrefix: '', isRootRecord: true })
  })
}
