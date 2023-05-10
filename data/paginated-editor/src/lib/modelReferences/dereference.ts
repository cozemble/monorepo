import type { DataRecordViewerClient } from '@cozemble/data-editor-sdk'
import type { DataRecord, ModelId, ReferencedRecords } from '@cozemble/model-core'

export async function dereference(
  dataRecordViewerClient: DataRecordViewerClient,
  referencedModelId: ModelId,
  referencedRecords: ReferencedRecords | null,
  setter: (value: DataRecord | null) => void,
) {
  console.log('dereference', { referencedRecords })
  if (!referencedRecords) {
    setter(null)
    return
  }
  if (referencedRecords.referencedRecords.length === 1) {
    const record = await dataRecordViewerClient.recordById(
      referencedModelId,
      referencedRecords.referencedRecords[0].referencedRecordId,
    )
    console.log('dereference', { record })
    setter(record)
  } else {
    setter(null)
  }
}
