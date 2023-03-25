import type { DataRecordViewerClient } from '@cozemble/data-editor-sdk'
import type { DataRecord, ModelId } from '@cozemble/model-core'
import type { ReferencedRecords } from '@cozemble/model-reference-core'

export async function dereference(
  dataRecordViewerClient: DataRecordViewerClient,
  referencedModelId: ModelId,
  references: ReferencedRecords | null,
  setter: (value: DataRecord | null) => void,
) {
  if (!references) {
    setter(null)
    return
  }
  if (references.referencedRecords.length === 1) {
    const record = await dataRecordViewerClient.recordById(
      referencedModelId,
      references.referencedRecords[0].referencedRecordId,
    )
    setter(record)
  } else {
    setter(null)
  }
}
