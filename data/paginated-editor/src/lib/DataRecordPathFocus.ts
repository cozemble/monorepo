import {
  dataRecordValuePathFns,
  modelFns,
  modelPathFns,
  valuesForModelPathFns,
} from '@cozemble/model-api'
import type {
  DataRecord,
  DataRecordPathParentElement,
  DataRecordValuePath,
  Model,
  ModelPath,
  SystemConfiguration,
} from '@cozemble/model-core'
import { dottedPathFns, type LeafModelSlot, modelPathElementFns } from '@cozemble/model-core'
import type { DataRecordValueChanged } from '@cozemble/data-editor-sdk'

export class DataRecordPathFocus {
  constructor(
    private readonly models: Model[],
    private readonly recordProvider: () => DataRecord,
    private readonly systemConfiguration: SystemConfiguration,
    private readonly focus: DataRecordValuePath | null = null,
  ) {}

  setInitial(model: Model): DataRecordPathFocus {
    const properties = modelFns.properties(model)
    if (properties.length === 0) {
      return this
    }
    return new DataRecordPathFocus(
      this.models,
      this.recordProvider,
      this.systemConfiguration,
      dataRecordValuePathFns.newInstance(properties[0]),
    )
  }

  applyValueChangedToFocus(event: DataRecordValueChanged): DataRecordPathFocus {
    if (this.focus === null) {
      throw new Error('Cannot apply value changed to focus when focus is null')
    }
    if (event.confirmMethod === 'Tab') {
      return this.moveFocusByDelta(1)
    } else if (event.confirmMethod === 'Enter') {
      return this._newFocus(null)
    }
    return this
  }

  private moveFocusByDelta(delta: number): DataRecordPathFocus {
    if (this.focus === null) {
      return this
    }
    const focus = this.focus
    const record = this.recordProvider()
    const models = this.models
    const model = modelFns.findById(models, record.modelId)
    const allPaths = modelFns
      .allPaths(models, model)
      .filter((p) => modelPathElementFns.isLeafSlot(p.lastElement)) as ModelPath<LeafModelSlot>[]
    const allValues = allPaths.flatMap((p) =>
      valuesForModelPathFns.flatten(
        modelPathFns.getValues(this.systemConfiguration, models, p, record),
      ),
    )
    const indexOfFocus = allValues.findIndex(
      (v) => v.path && dataRecordValuePathFns.sameDottedPaths(v.path, focus),
    )
    if (indexOfFocus === -1) {
      return this._newFocus(null)
    }
    const nextValue = allValues[indexOfFocus + delta]
    return this._newFocus(nextValue ? nextValue.path : null)
  }

  focusFromDottedNamePath(dottedNamePath: string): DataRecordPathFocus {
    const model = modelFns.findById(this.models, this.recordProvider().modelId)
    const newFocus = dataRecordValuePathFns.fromDottedPath(
      this.models,
      model,
      dottedPathFns.dottedNamePath(dottedNamePath),
    )
    return this._newFocus(newFocus)
  }

  clearFocus(): DataRecordPathFocus {
    return this._newFocus(null)
  }

  moveFocus(direction: 'left' | 'right'): DataRecordPathFocus {
    return this.moveFocusByDelta(direction === 'left' ? -1 : 1)
  }

  isPropertyFocussed(slot: LeafModelSlot, parentPath: DataRecordPathParentElement[]): boolean {
    console.log({ slot, parentPath, focus: this.focus })
    if (this.focus === null) {
      return false
    }
    const propertyPath = dataRecordValuePathFns.toDottedPath(
      dataRecordValuePathFns.newInstance(slot, ...parentPath),
    )
    const focusPath = dataRecordValuePathFns.toDottedPath(this.focus)
    console.log({ propertyPath, focusPath })
    return dottedPathFns.equals(propertyPath, focusPath)
  }

  _newFocus(focus: DataRecordValuePath | null): DataRecordPathFocus {
    return new DataRecordPathFocus(
      this.models,
      this.recordProvider,
      this.systemConfiguration,
      focus,
    )
  }
}
