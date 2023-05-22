import type { DataRecordEditorClient, DataRecordViewerClient } from '@cozemble/data-editor-sdk'
import type { DataRecord, DataRecordId, ModelId } from '@cozemble/model-core'
import type { EventSourcedRecordGraph } from '@cozemble/model-event-sourced/dist/esm'

export async function dereference(
  client: DataRecordViewerClient | DataRecordEditorClient,
  graph: EventSourcedRecordGraph,
  referencedModelId: ModelId,
  referencedRecords: DataRecordId[],
  setter: (value: DataRecord | null) => void,
) {
  if (referencedRecords.length === 0) {
    setter(null)
    return
  }
  if (referencedRecords.length === 1) {
    const maybeInGraph = graph.relatedRecords.find((r) => r.id.value === referencedRecords[0].value)
    if (maybeInGraph) {
      setter(maybeInGraph)
      return
    }
    const record = await client.recordById(referencedModelId, referencedRecords[0])
    setter(record)
  } else {
    setter(null)
  }
}
