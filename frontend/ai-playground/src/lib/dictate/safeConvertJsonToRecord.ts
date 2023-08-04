import type { DataRecord, Model, SystemConfiguration } from '@cozemble/model-core'
import { jsonToRecord } from '@cozemble/model-to-json'
import { modelFns } from '@cozemble/model-api'

export function safeConvertJsonToRecord(
  systemConfiguration: SystemConfiguration,
  models: Model[],
  model: Model,
  json: any,
): DataRecord | null {
  try {
    const fromJsonRecord = jsonToRecord(models, model, 'text-user', json)
    modelFns.validate(systemConfiguration, models, fromJsonRecord)
    return fromJsonRecord
  } catch (e: any) {
    console.error('Failed to convert json to record', e)
    return null
  }
}
