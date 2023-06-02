import type { GettableWritable } from '../editors/GettableWritable'
import { gettableWritable } from '../editors/GettableWritable'
import type {
  DataRecord,
  DataRecordId,
  Model,
  ModelReference,
  SystemConfiguration,
} from '@cozemble/model-core'
import { dataRecordFns } from '@cozemble/model-api'
import type {
  DataRecordEditEvent,
  EventSourcedDataRecord,
  EventSourcedRecordGraph,
} from '@cozemble/model-event-sourced'
import {
  eventSourcedDataRecordFns,
  eventSourcedRecordGraphFns,
  recordGraphEvents,
} from '@cozemble/model-event-sourced'

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
      if (
        event._type === 'data.record.value.changed' &&
        event.path.lastElement._type === 'model.reference'
      ) {
        return this.modelReferenceSelected(
          graph,
          event.record,
          event.path.lastElement,
          event.newValue,
        )
      }
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

  modelReferenceSelected(
    graph: EventSourcedRecordGraph,
    recordBeingEdited: DataRecord,
    modelReference: ModelReference,
    selectedRecordIds: DataRecordId[],
  ): EventSourcedRecordGraph {
    const mutated = eventSourcedRecordGraphFns.addEvent(
      graph,
      recordGraphEvents.recordReferencesChanged(
        recordBeingEdited,
        modelReference,
        selectedRecordIds,
      ),
    )
    return mutated
  }
}

export function eventSourcedRecordGraphStore(
  systemConfigurationProvider: () => SystemConfiguration,
  allModelsProvider: () => Model[],
  modelProvider: () => Model,
  currentUser: string,
  initialRecords: EventSourcedDataRecord[] = [],
): EventSourcedRecordGraphStore {
  return new EventSourcedRecordGraphStoreImpl(
    systemConfigurationProvider,
    allModelsProvider,
    modelProvider,
    currentUser,
    gettableWritable(eventSourcedRecordGraphFns.newInstance(initialRecords, [], [])),
  )
}
