import type { DataRecordEditorClient, DataRecordViewerClient } from '@cozemble/data-editor-sdk'
import type { DataRecordId, ModelId, RecordAndEdges } from '@cozemble/model-core'
import { recordAndEdges, recordGraphEdgeFns } from '@cozemble/model-core'
import type { EventSourcedRecordGraph } from '@cozemble/model-event-sourced'
import type { SubGraphCollectorsByRecordId } from '$lib/records/RecordControls'
import { subGraphCollectorFns } from '$lib/records/RecordControls'
import { eventSourcedRecordGraphFns } from '@cozemble/model-event-sourced'

function searchSubGraphs(
  recordId: DataRecordId,
  subGraphCollectorsByRecordId: SubGraphCollectorsByRecordId,
  referencedRecordId: DataRecordId,
) {
  const subGraphCollector =
    subGraphCollectorsByRecordId[recordId.value] ?? subGraphCollectorFns.empty()
  const flattened = subGraphCollector.created.reduce((acc, collector) => {
    return eventSourcedRecordGraphFns.merge(acc, collector)
  }, eventSourcedRecordGraphFns.empty())
  const maybe = flattened.records.find((r) => r.record.id.value === referencedRecordId.value)
  if (maybe) {
    return maybe.record
  }
  return null
}

export async function getReferencedRecord(
  client: DataRecordViewerClient | DataRecordEditorClient,
  graph: EventSourcedRecordGraph,
  recordId: DataRecordId,
  subGraphCollectorsByRecordId: SubGraphCollectorsByRecordId,
  referencedModelId: ModelId,
  referencedRecordId: DataRecordId,
): Promise<RecordAndEdges | null> {
  const maybeInGraph =
    graph.relatedRecords.find((r) => r.id.value === referencedRecordId.value) ??
    searchSubGraphs(recordId, subGraphCollectorsByRecordId, referencedRecordId)
  if (maybeInGraph) {
    return recordAndEdges(
      maybeInGraph,
      recordGraphEdgeFns.forRecord(
        graph.edges.map((e) => e.edge),
        maybeInGraph.id,
      ),
    )
  }
  return await client.recordById(referencedModelId, referencedRecordId)
}
