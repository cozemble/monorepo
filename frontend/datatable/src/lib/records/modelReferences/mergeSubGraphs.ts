import type { DataRecordId } from '@cozemble/model-core'
import type { EventSourcedRecordGraph } from '@cozemble/model-event-sourced'
import { eventSourcedRecordGraphFns } from '@cozemble/model-event-sourced'
import type { SubGraphCollectorsByRecordId } from '$lib/records/RecordControls'
import { subGraphCollectorFns } from '$lib/records/RecordControls'

export function mergeSubGraphs(
  recordId: DataRecordId,
  initialGraph: EventSourcedRecordGraph,
  subGraphCollectorsByRecordId: SubGraphCollectorsByRecordId,
): EventSourcedRecordGraph {
  const subGraphCollector =
    subGraphCollectorsByRecordId[recordId.value] ?? subGraphCollectorFns.empty()
  return subGraphCollector.created.reduce((acc, collector) => {
    return eventSourcedRecordGraphFns.merge(acc, collector)
  }, initialGraph)
}
