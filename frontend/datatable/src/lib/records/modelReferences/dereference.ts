import type { DataRecordEditorClient, DataRecordViewerClient } from '@cozemble/data-editor-sdk'
import type { DataRecordId, ModelId, RecordAndEdges } from '@cozemble/model-core'
import { recordAndEdges, recordGraphEdgeFns } from '@cozemble/model-core'
import type { EventSourcedRecordGraph } from '@cozemble/model-event-sourced'

export async function dereference(
  client: DataRecordViewerClient | DataRecordEditorClient,
  graph: EventSourcedRecordGraph,
  referencedModelId: ModelId,
  referencedRecords: DataRecordId[],
  setter: (value: RecordAndEdges | null) => void,
) {
  if (referencedRecords.length === 0) {
    setter(null)
    return
  }
  if (referencedRecords.length === 1) {
    const maybeInGraph = graph.relatedRecords.find((r) => r.id.value === referencedRecords[0].value)
    if (maybeInGraph) {
      setter(
        recordAndEdges(maybeInGraph, recordGraphEdgeFns.forRecord(graph.edges, maybeInGraph.id)),
      )
      return
    }
    const record = await client.recordById(referencedModelId, referencedRecords[0])
    setter(record)
  } else {
    setter(null)
  }
}
