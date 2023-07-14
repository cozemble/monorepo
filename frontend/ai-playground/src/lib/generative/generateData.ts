import type { DataRecord, Model } from '@cozemble/model-core'
import { convertModelToJsonSchema } from '$lib/convertModelToJsonSchema'
import { jsonToRecord, modelToJson } from '@cozemble/model-to-json'
import { generatedDataBatches } from '$lib/generative/stores'
import type { JustErrorMessage, Value } from '@cozemble/lang-util'
import { arrays, uuids } from '@cozemble/lang-util'
import { setCurrentAiChatRequest } from '$lib/chat/ChatTypes'

function getExistingRecordsSummary(model: Model, existingRecords: DataRecord[]): any[] {
  existingRecords = arrays.dropLast(existingRecords)
  model = { ...model, nestedModels: [] }
  return existingRecords.map((record) => modelToJson([model], record))
}

export async function generateData(
  allModels: Model[],
  model: Model,
  existingRecords: DataRecord[],
): Promise<void> {
  async function onChatResponse(response: JustErrorMessage | Value) {
    if (response._type === 'value') {
      const generatedData = response.value
      const records: DataRecord[] = generatedData.map((data: any) =>
        jsonToRecord(allModels, model, 'ai-playground', data),
      )
      generatedDataBatches.update((batches) => {
        batches.push({
          _type: 'generated.data.batch',
          id: uuids.v4(),
          records,
        })
        return batches
      })
    }
  }

  const existingRecordsSummary = getExistingRecordsSummary(model, existingRecords)
  const existingSchema = convertModelToJsonSchema(model, allModels)
  const payload = { existingSchema, pluralTitle: model.pluralName.value, existingRecordsSummary }
  setCurrentAiChatRequest('/generateData', payload, onChatResponse)
}

export interface GeneratedDataBatch {
  _type: 'generated.data.batch'
  id: string
  records: DataRecord[]
}
