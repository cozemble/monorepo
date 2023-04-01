import type { DataRecord, DataRecordPropertyPath, Model, ModelId } from '@cozemble/model-core'
import { DataRecordPathFocus } from './DataRecordPathFocus'
import { writable, type Writable } from 'svelte/store'
import { modelFns } from '@cozemble/model-api'
import {
  type DataRecordEditEvent,
  type EventSourcedDataRecord,
  eventSourcedDataRecordFns,
} from '@cozemble/data-editor-sdk'
import { uuids } from '@cozemble/lang-util'

export interface RecordSaveSucceeded {
  _type: 'record.save.succeeded'
  record: DataRecord
}

export function recordSaveSucceeded(record: DataRecord): RecordSaveSucceeded {
  return { _type: 'record.save.succeeded', record }
}

export interface RecordSaveFailed {
  _type: 'record.save.failed'
  errors: string[]
  dataErrors: Map<DataRecordPropertyPath, string[]>
}

export function recordSaveFailed(
  errors: string[],
  dataErrors: Map<DataRecordPropertyPath, string[]>,
): RecordSaveFailed {
  return { _type: 'record.save.failed', errors, dataErrors }
}

export type RecordSaveOutcome = RecordSaveSucceeded | RecordSaveFailed

export type RecordSaveFunction = (record: EventSourcedDataRecord) => Promise<RecordSaveOutcome>

export class RecordEditContext {
  constructor(
    public models: Model[],
    public saveNewRecord: RecordSaveFunction,
    public eventSourcedRecord: EventSourcedDataRecord,
    public onSave: RecordSaveFunction,
    public onCancel: () => void,
    public title: string,
    public _errors: Map<DataRecordPropertyPath, string[]> = new Map(),
    public errors: Writable<Map<DataRecordPropertyPath, string[]>> = writable(_errors),
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

  async attemptSave() {
    if (this._errors.size === 0) {
      await this.onSave(this.eventSourcedRecord)
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

export function createDependentRecordContext(
  currentContext: RecordEditContext,
  dependentModelId: ModelId,
  onSave: RecordSaveFunction,
  onCancel: () => void,
) {
  const dependentModel = modelFns.findById(currentContext.models, dependentModelId)
  return new RecordEditContext(
    currentContext.models,
    currentContext.saveNewRecord,
    eventSourcedDataRecordFns.newInstance(
      currentContext.models,
      dependentModelId,
      currentContext.eventSourcedRecord.record.createdBy.value,
    ),
    onSave,
    onCancel,
    `New ${dependentModel.name.value}`,
  )
}
