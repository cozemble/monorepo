import type { GettableWritable } from '../editors/GettableWritable'
import { gettableWritable } from '../editors/GettableWritable'
import type { DataRecordEditEvent, EventSourcedDataRecord } from '@cozemble/data-editor-sdk'
import type { DataRecordId } from '@cozemble/model-core'
import { eventSourcedDataRecordFns } from '@cozemble/data-editor-sdk'
import type { SystemConfiguration } from '@cozemble/model-core'

export interface EventSourcedDataRecordsStore extends GettableWritable<EventSourcedDataRecord[]> {
  updateRecord(recordId: DataRecordId, event: DataRecordEditEvent): void
}

class EventSourcedDataRecordsStoreImpl implements EventSourcedDataRecordsStore {
  constructor(
    private readonly systemConfigurationProvider: () => SystemConfiguration,
    private readonly underlying: GettableWritable<EventSourcedDataRecord[]>,
  ) {}

  set(value: EventSourcedDataRecord[]): void {
    this.underlying.set(value)
  }

  subscribe(run: (value: EventSourcedDataRecord[]) => void): () => void {
    return this.underlying.subscribe(run)
  }

  update(updater: (value: EventSourcedDataRecord[]) => EventSourcedDataRecord[]): void {
    this.underlying.update(updater)
  }

  get(): EventSourcedDataRecord[] {
    return this.underlying.get()
  }

  updateRecord(recordId: DataRecordId, event: DataRecordEditEvent): void {
    this.update((records) => {
      const record = records.find((r) => r.record.id.value === recordId.value)
      if (!record) {
        throw new Error('Record not found: ' + recordId)
      }
      const mutated = eventSourcedDataRecordFns.addEvent(
        this.systemConfigurationProvider(),
        event,
        record,
      )
      console.log({ record, mutated })
      return records.map((r) => (r.record.id.value === recordId.value ? mutated : r))
    })
  }
}

export function eventSourcedDataRecordsStore(
  systemConfigurationProvider: () => SystemConfiguration,
  initialRecords: EventSourcedDataRecord[] = [],
): EventSourcedDataRecordsStore {
  return new EventSourcedDataRecordsStoreImpl(
    systemConfigurationProvider,
    gettableWritable(initialRecords),
  )
}
