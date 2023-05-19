import type { DataRecordEditorClient, DataRecordViewerClient } from '@cozemble/data-editor-sdk'
import type { DataRecord, DataRecordId, ModelId } from '@cozemble/model-core'

export async function dereference(
  client: DataRecordViewerClient | DataRecordEditorClient,
  referencedModelId: ModelId,
  referencedRecords: DataRecordId[],
  setter: (value: DataRecord | null) => void,
) {
  if (referencedRecords.length === 0) {
    setter(null)
    return
  }
  if (referencedRecords.length === 1) {
    const record = await client.recordById(referencedModelId, referencedRecords[0])
    setter(record)
  } else {
    setter(null)
  }
}
