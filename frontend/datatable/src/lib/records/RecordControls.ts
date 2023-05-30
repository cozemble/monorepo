import type { DataRecordId } from '@cozemble/model-core'
import type { JustErrorMessage } from '@cozemble/lang-util'
import type { EventSourcedRecordGraph } from '@cozemble/model-event-sourced'

export interface SubGraphCollector {
  _type: 'sub.graph.collector'
  created: EventSourcedRecordGraph[]
}

export const subGraphCollectorFns = {
  empty: (): SubGraphCollector => ({
    _type: 'sub.graph.collector',
    created: [],
  }),
  addCreated: (collector: SubGraphCollector, created: EventSourcedRecordGraph): void => {
    collector.created.push(created)
  },
}

export type SubGraphCollectorsByRecordId = { [recordId: string]: SubGraphCollector }

export const subGraphCollectorsByRecordIdFns = {
  addCreated: (
    collector: SubGraphCollectorsByRecordId,
    recordId: DataRecordId,
    created: EventSourcedRecordGraph,
  ): void => {
    if (!collector[recordId.value]) {
      collector[recordId.value] = subGraphCollectorFns.empty()
    }
    subGraphCollectorFns.addCreated(collector[recordId.value], created)
  },
}

export interface RecordControls {
  saveRecord(record: DataRecordId): Promise<JustErrorMessage | null>

  saveNewRecord(record: DataRecordId): Promise<JustErrorMessage | null>
}
