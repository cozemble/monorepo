import type { GettableWritable } from '../editors/GettableWritable'
import { gettableWritable } from '../editors/GettableWritable'
import type { DataRecordEditEvent, EventSourcedRecordGraph } from '@cozemble/data-editor-sdk'
import { eventSourcedDataRecordFns, eventSourcedRecordGraphFns } from '@cozemble/data-editor-sdk'
import type { DataRecordId, Model, SystemConfiguration } from '@cozemble/model-core'
import { dataRecordFns } from '@cozemble/model-api'
import type { EventSourcedRecordGraphNode } from '@cozemble/data-editor-sdk'

export interface EventSourcedRecordGraphStore extends GettableWritable<EventSourcedRecordGraph> {
  updateRecord(recordId: DataRecordId, event: DataRecordEditEvent): void

  addNewRecord(): DataRecordId

  appendNewRecord(): DataRecordId
}

class EventSourcedRecordGraphStoreImpl implements EventSourcedRecordGraphStore {
  constructor(
    private readonly systemConfigurationProvider: () => SystemConfiguration,
    private readonly allModelsProvider: () => Model[],
    private readonly modelProvider: () => Model,
    private readonly currentUser: string,
    private readonly underlying: GettableWritable<EventSourcedRecordGraph>,
  ) {}

  set(value: EventSourcedRecordGraph): void {
    this.underlying.set(value)
  }

  subscribe(run: (value: EventSourcedRecordGraph) => void): () => void {
    return this.underlying.subscribe(run)
  }

  update(updater: (value: EventSourcedRecordGraph) => EventSourcedRecordGraph): void {
    this.underlying.update(updater)
  }

  get(): EventSourcedRecordGraph {
    return this.underlying.get()
  }

  updateRecord(recordId: DataRecordId, event: DataRecordEditEvent): void {
    this.update((graph) => {
      return eventSourcedRecordGraphFns.addRecordEditEvent(
        this.systemConfigurationProvider(),
        graph,
        recordId,
        event,
      )
    })
  }

  addNewRecord(): DataRecordId {
    const model = this.modelProvider()
    const newRecord = dataRecordFns.newInstance(model, this.currentUser)
    const record = eventSourcedDataRecordFns.fromRecord(this.allModelsProvider(), newRecord)
    this.update((graph) => {
      return eventSourcedRecordGraphFns.appendRecord(graph, record)
    })
    return newRecord.id
  }

  appendNewRecord(): DataRecordId {
    return this.addNewRecord()
  }
}

export function eventSourcedRecordGraphStore(
  systemConfigurationProvider: () => SystemConfiguration,
  allModelsProvider: () => Model[],
  modelProvider: () => Model,
  currentUser: string,
  initialNodes: EventSourcedRecordGraphNode[] = [],
): EventSourcedRecordGraphStore {
  return new EventSourcedRecordGraphStoreImpl(
    systemConfigurationProvider,
    allModelsProvider,
    modelProvider,
    currentUser,
    gettableWritable(eventSourcedRecordGraphFns.newInstance(initialNodes, [])),
  )
}
