import type { DataRecordViewerClient } from '@cozemble/data-editor-sdk'
import type { DataRecord, ModelId, ReferencedRecords } from '@cozemble/model-core'

export async function dereference(
  dataRecordViewerClient: DataRecordViewerClient,
  referencedModelId: ModelId,
  referencedRecords: ReferencedRecords | null,
  setter: (value: DataRecord | null) => void,
) {
  if (!referencedRecords) {
    setter(null)
    return
  }
  if (referencedRecords.referencedRecords.length === 1) {
    const record = await dataRecordViewerClient.recordById(
      referencedModelId,
      referencedRecords.referencedRecords[0].referencedRecordId,
    )
    setter(record)
  } else {
    setter(null)
  }
}
