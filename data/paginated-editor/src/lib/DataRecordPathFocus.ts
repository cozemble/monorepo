import { dataRecordPathFns, modelFns, modelPathFns } from '@cozemble/model-api'
import type {
  DataRecord,
  DataRecordPath,
  DataRecordPathElement,
  Model,
  ModelPath,
  Property,
} from '@cozemble/model-core'
import { dottedPathFns } from '@cozemble/model-core'
import type { DataRecordValueChanged } from '@cozemble/model-editor-sdk'

export class DataRecordPathFocus {
  constructor(
    private readonly models: Model[],
    private readonly recordProvider: () => DataRecord,
    private readonly focus: DataRecordPath | null = null,
  ) {}

  setInitial(model: Model): DataRecordPathFocus {
    return new DataRecordPathFocus(
      this.models,
      this.recordProvider,
      dataRecordPathFns.newInstance(model.properties[0]),
    )
  }

  applyValueChangedToFocus(event: DataRecordValueChanged): DataRecordPathFocus {
    if (this.focus === null) {
      throw new Error('Cannot apply value changed to focus when focus is null')
    }
    const focus = this.focus
    const record = this.recordProvider()
    const models = this.models
    if (event.confirmMethod === 'Tab') {
      const model = modelFns.findById(models, record.modelId)
      const allPaths = modelFns
        .allPaths(models, model)
        .filter((p) => p.lastElement._type === 'property') as ModelPath<Property>[]
      const allValues = allPaths.flatMap((p) => modelPathFns.getValues(models, p, record))
      const indexOfFocus = allValues.findIndex((v) =>
        dataRecordPathFns.sameDottedPaths(v.path, focus),
      )
      const nextValue = allValues[indexOfFocus + 1]
      return this._newFocus(nextValue ? nextValue.path : null)
    } else if (event.confirmMethod === 'Enter') {
      return this._newFocus(null)
    }
    return this
  }

  focusFromDottedNamePath(dottedNamePath: string): DataRecordPathFocus {
    const model = modelFns.findById(this.models, this.recordProvider().modelId)
    const newFocus = dataRecordPathFns.fromDottedPath(
      this.models,
      model,
      dottedPathFns.dottedNamePath(dottedNamePath),
    )
    console.log({ dottedNamePath, newFocus })
    return this._newFocus(newFocus)
  }

  clearFocus(): DataRecordPathFocus {
    return this._newFocus(null)
  }

  isPropertyFocussed(property: Property, parentPath: DataRecordPathElement[]): boolean {
    if (this.focus === null) {
      return false
    }
    const propertyPath = dataRecordPathFns.toDottedPath(
      dataRecordPathFns.newInstance(property, ...parentPath),
    )
    const focusPath = dataRecordPathFns.toDottedPath(this.focus)
    return dottedPathFns.equals(propertyPath, focusPath)
  }

  _newFocus(focus: DataRecordPath | null): DataRecordPathFocus {
    return new DataRecordPathFocus(this.models, this.recordProvider, focus)
  }
}
