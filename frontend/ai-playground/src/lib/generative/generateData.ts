import type { DataRecord, Model } from '@cozemble/model-core'
import { convertModelToJsonSchema } from '$lib/convertModelToJsonSchema'
import { jsonToRecord } from '@cozemble/model-to-json'
import { generatedDataBatches } from '$lib/generative/stores'
import { uuids } from '@cozemble/lang-util'
import { arrays } from '@cozemble/lang-util'
import { modelToJson } from '@cozemble/model-to-json/dist/esm'

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
  const existingRecordsSummary = getExistingRecordsSummary(model, existingRecords)
  console.log({ existingRecordsSummary })
  const existingSchema = convertModelToJsonSchema(model, allModels)
  const payload = { existingSchema, pluralTitle: model.pluralName.value, existingRecordsSummary }
  const fetched = await fetch('/generateData', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
  if (!fetched.ok) {
    throw new Error('Something went wrong, please try again')
  }
  const fetchedResponse = await fetched.json()
  const generatedData = JSON.parse(fetchedResponse.result)
  const records: DataRecord[] = generatedData.map((data: any) =>
    jsonToRecord(allModels, model, 'ai-playground', data),
  )
  console.log({ records })
  generatedDataBatches.update((batches) => {
    batches.push({
      _type: 'generated.data.batch',
      id: uuids.v4(),
      records,
    })
    return batches
  })
}

export interface GeneratedDataBatch {
  _type: 'generated.data.batch'
  id: string
  records: DataRecord[]
}
