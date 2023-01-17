import type { DataRecordPath, Model } from '@cozemble/model-core'
import { DataRecordPathFocus } from '$lib/DataRecordPathFocus'
import { writable, type Writable } from 'svelte/store'
import { modelFns } from '@cozemble/model-api'
import {
  type DataRecordEditEvent,
  type EventSourcedDataRecord,
  eventSourcedDataRecordFns,
} from '@cozemble/data-editor-sdk'
import { uuids } from '@cozemble/lang-util'

export class RecordEditContext {
  constructor(
    public models: Model[],
    private eventSourcedRecord: EventSourcedDataRecord,
    public onSave: (record: EventSourcedDataRecord) => void,
    public onCancel: () => void,
    public title: string,
    public _errors: Map<DataRecordPath, string[]> = new Map(),
    public errors: Writable<Map<DataRecordPath, string[]>> = writable(_errors),
    public model = modelFns.findById(models, eventSourcedRecord.record.modelId),
    public focus = writable(
      new DataRecordPathFocus(models, () => eventSourcedRecord.record).setInitial(model),
    ),
    public record = writable(eventSourcedRecord.record),
    public child: RecordEditContext | null = null,
    public showErrors: Writable<boolean> = writable(false),
    public id = uuids.v4(),
  ) {
    this._setRecord(eventSourcedRecord)
  }

  handleDataRecordEditEvent(event: DataRecordEditEvent) {
    this._setRecord(eventSourcedDataRecordFns.addEvent(event, this.eventSourcedRecord))
    if (event._type === 'data.record.value.changed') {
      this.focus.update((f) => f.applyValueChangedToFocus(event))
    }
  }

  attemptSave() {
    console.log('attemptSave', {
      model: this.model,
      record: this.eventSourcedRecord,
      errors: this._errors,
    })
    if (this._errors.size === 0) {
      this.onSave(this.eventSourcedRecord)
    } else {
      this.showErrors.set(true)
    }
  }

  cancel() {
    this.onCancel()
  }

  prefixTitle(prefix: string) {
    this.title = `${prefix} ${this.title}`
  }

  private _setRecord(record: EventSourcedDataRecord) {
    this.eventSourcedRecord = record
    this.record.set(record.record)
    this._errors = modelFns.validate(this.models, this.eventSourcedRecord.record)
    this.errors.set(this._errors)
  }
}
