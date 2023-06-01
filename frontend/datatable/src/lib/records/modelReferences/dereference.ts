import type { DataRecordEditorClient, DataRecordViewerClient } from '@cozemble/data-editor-sdk'
import type { DataRecordId, ModelId, RecordAndEdges } from '@cozemble/model-core'
import { recordAndEdges, recordGraphEdgeFns } from '@cozemble/model-core'
import type { EventSourcedRecordGraph } from '@cozemble/model-event-sourced'
import type { SubGraphCollectorsByRecordId } from '$lib/records/RecordControls'

export async function getReferencedRecord(
  client: DataRecordViewerClient | DataRecordEditorClient,
  graph: EventSourcedRecordGraph,
  subGraphCollectorsByRecordId: SubGraphCollectorsByRecordId,
  referencedModelId: ModelId,
  recordId: DataRecordId,
): Promise<RecordAndEdges | null> {
  const maybeInGraph = graph.relatedRecords.find((r) => r.id.value === recordId.value)
  if (maybeInGraph) {
    return recordAndEdges(
      maybeInGraph,
      recordGraphEdgeFns.forRecord(
        graph.edges.map((e) => e.edge),
        maybeInGraph.id,
      ),
    )
  }
  return await client.recordById(referencedModelId, recordId)
}
