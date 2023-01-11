import type { DataRecord, DataRecordPath, Model } from '@cozemble/model-core'
import { DataRecordPathFocus } from '$lib/DataRecordPathFocus'
import { writable, type Writable } from 'svelte/store'
import { dataRecordFns, modelFns } from '@cozemble/model-api'
import type { DataRecordEditEvent } from '@cozemble/model-editor-sdk'
import { applyValueChangedToRecord } from '$lib/onValueChanged'
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
      this._record = applyValueChangedToRecord(this.models, this._record, event)
      this.focus.update((f) => f.applyValueChangedToFocus(event))
      this._errors = modelFns.validate(this.models, this._record)
      this.record.set(this._record)
      this.errors.set(this._errors)
      console.log({ mutatedRecord: this._record })
    } else if (event._type === 'data.record.edit.aborted') {
      console.log({ event })
    }
  }

  attemptSave() {
    console.log('attemptSave', { record: this._record, errors: this._errors })
    if (this._errors.size === 0) {
      this.onSave(this._record)
    } else {
      this.showErrors.set(true)
      console.log("Can't save because of errors")
    }
  }

  cancel() {
    this.onCancel()
  }

  prefixTitle(prefix: string) {
    this.title = `${prefix} ${this.title}`
  }
}
