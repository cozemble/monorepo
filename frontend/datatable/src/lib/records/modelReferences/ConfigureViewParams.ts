import type { DataRecord, DataRecordValuePath, Model, ModelReference } from '@cozemble/model-core'
import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'
import { modelFns } from '@cozemble/model-api'
import type { DataRecordViewerClient } from '@cozemble/data-editor-sdk'
import type { DataRecordEditorClient } from '@cozemble/data-editor-sdk'
import { modelReferenceFns } from '@cozemble/model-core'

export interface ConfigureViewParams {
  models: Model[]
  model: Model
  sampleRecords: Writable<DataRecord[]>
}

export async function makeConfigureViewParams(
  client: DataRecordViewerClient | DataRecordEditorClient,
  models: Model[],
  recordPath: DataRecordValuePath,
): Promise<ConfigureViewParams> {
  if (recordPath.lastElement._type !== 'model.reference') {
    throw new Error('Expected last element to be a model reference')
  }
  const modelReference = recordPath.lastElement as ModelReference
  const referencedModelId = modelReferenceFns.getReferencedModelId(modelReference)
  if (referencedModelId === null) {
    throw new Error(`No referenced model id for ${modelReference.name.value}`)
  }
  const referencedModel = modelFns.findById(models, referencedModelId)
  const sampleRecords = writable<DataRecord[]>([])
  client.searchRecords(referencedModel.id, '').then((found) => {
    sampleRecords.set(found.records.slice(0, 3))
  })
  return { models, model: referencedModel, sampleRecords }
}
