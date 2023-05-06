import type { DataRecord, ModelId } from '@cozemble/model-core'
import { writable } from 'svelte/store'

export interface CreateNewRecord {
  modelId: ModelId
  onCreated: (value: DataRecord) => void
  onCancel: () => void
}

export const createNewRecordStore = writable<CreateNewRecord | null>(null)

export function createNewRecord(
  modelId: ModelId,
  onCreated: (value: DataRecord) => void,
  onCancel: () => void,
): void {
  createNewRecordStore.set({ modelId, onCreated, onCancel })
}
