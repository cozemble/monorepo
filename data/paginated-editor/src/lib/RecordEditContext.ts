import type { DataRecord, DataRecordPath, Model } from '@cozemble/model-core'
import { DataRecordPathFocus } from '$lib/DataRecordPathFocus'
import { writable, type Writable } from 'svelte/store'
import { dataRecordFns, dataRecordPathFns, modelFns } from '@cozemble/model-api'
import type { DataRecordEditEvent } from '@cozemble/model-editor-sdk'
import { uuids } from '@cozemble/lang-util'

export class RecordEditContext {
  constructor(
    public models: Model[],
    private _record: DataRecord,
    public onSave: (record: DataRecord) => void,
    public onCancel: () => void,
    public title: string,
    public _errors: Map<DataRecordPath, string[]> = new Map(),
    public errors: Writable<Map<DataRecordPath, string[]>> = writable(_errors),
    public model = modelFns.findById(models, _record.modelId),
    public focus = writable(new DataRecordPathFocus(models, () => _record).setInitial(model)),
    public record = writable(_record),
    public child: RecordEditContext | null = null,
    public showErrors: Writable<boolean> = writable(false),
    public id = uuids.v4(),
  ) {
    this._record = dataRecordFns.fullStructure(this.models, this._record)
    this.record.set(this._record)
    this._errors = modelFns.validate(this.models, this._record)
    this.errors.set(this._errors)
  }

  handleDataRecordEditEvent(event: DataRecordEditEvent) {
    if (event._type === 'data.record.value.changed') {
      this._setRecord(
        dataRecordPathFns.setValue(this.models, event.path, this._record, event.newValue),
      )
      this.focus.update((f) => f.applyValueChangedToFocus(event))
    } else if (event._type === 'data.record.edit.aborted') {
      console.log({ event })
    } else if (event._type === 'data.record.has.many.item.added') {
      this._setRecord(
        dataRecordPathFns.addHasManyItem(
          this.models,
          event.parentPath,
          event.relationship,
          this._record,
          event.newRecord,
        ),
      )
    }
  }

  attemptSave() {
    console.log('attemptSave', { model: this.model, record: this._record, errors: this._errors })
    if (this._errors.size === 0) {
      this.onSave(this._record)
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

  private _setRecord(record: DataRecord) {
    this._record = record
    this.record.set(record)
    this._errors = modelFns.validate(this.models, this._record)
    this.errors.set(this._errors)
    console.log({ models: this.models, mutatedRecord: this._record, errors: this._errors })
  }
}
