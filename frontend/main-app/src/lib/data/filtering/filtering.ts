import type {
  DataRecord,
  DataRecordValuePath,
  Model,
  ModelId,
  ModelPath,
  ModelPathElement,
  ModelView,
  Property,
} from '@cozemble/model-core'
import {
  propertyDescriptors,
  propertyIdFns,
  propertyNameFns,
  type SystemConfiguration,
} from '@cozemble/model-core'
import { dataRecordFns, dataRecordValuePathFns, modelFns, modelPathFns } from '@cozemble/model-api'
import { filterOperations } from '@cozemble/data-filters-config'
import type { FilterDataType, LhsOption } from '@cozemble/data-filters-core'
import { lhsOption, userSuppliedRhsOption } from '@cozemble/data-filters-core'
import { mandatory } from '@cozemble/lang-util'
import { eventSourcedModelFns } from '@cozemble/model-event-sourced'
import { slotEditorRegistry } from '@cozemble/model-assembled'
import type { DataRecordEditorClient } from '@cozemble/data-editor-sdk'
import {
  type AttachmentIdAndFileName,
  type DataRecordControlEvent,
  type DataRecordEditEvent,
  eventSourcedDataRecordFns,
  type UploadedAttachment,
} from '@cozemble/data-editor-sdk'
import type {
  FilterGroupList,
  FilterInstanceList,
  FilterOperator,
} from '@cozemble/data-filters-core/dist/esm'

export function getFilterablePaths(models: Model[], model: Model): ModelPath<ModelPathElement>[] {
  return modelFns.allPaths(models, model).filter((path) => {
    const lastElement = path.lastElement
    return (
      lastElement._type === 'property' && filterOperations.get(lastElement.propertyType) !== null
    )
  })
}

export function getFilterLhsOptionsForModel(models: Model[], model: Model): LhsOption[] {
  return getFilterablePaths(models, model).flatMap((path) => {
    const lastElement = path.lastElement
    if (lastElement._type === 'property') {
      const filterOperation = filterOperations.get(lastElement.propertyType)
      if (filterOperation !== null) {
        return [
          lhsOption(
            modelPathFns.toDottedIdPath(path).value,
            modelPathFns.toDottedNamePath(path).value,
            lastElement.propertyType,
            filterOperation,
            [userSuppliedRhsOption()],
          ),
        ]
      }
    }
    return []
  })
}

export interface EverythingForFiltering {
  model: Model
  record: DataRecord
  recordPath: DataRecordValuePath
  editorComponent: any
  editorClient: DataRecordEditorClient
}

export function createModelAndRecordForFiltering(
  systemConfiguration: SystemConfiguration,
  propertyType: FilterDataType,
  onValueProvided: (value: any) => void,
): EverythingForFiltering {
  const propertyDescriptor = mandatory(
    propertyDescriptors
      .list()
      .find((descriptor) => descriptor.propertyType.value === propertyType.value),
    `Property descriptor for ${propertyType.value} not found`,
  )
  let model = eventSourcedModelFns.newInstance(modelFns.newInstance('Filter model'))
  const newPropertyEvent = propertyDescriptor.newProperty(
    systemConfiguration,
    model.model.id,
    propertyNameFns.newInstance('Filter property'),
    propertyIdFns.newInstance('filterProperty'),
  )
  model = eventSourcedModelFns.addEvent(model, newPropertyEvent)
  const record = dataRecordFns.newInstance(model.model, '')
  const property = model.model.slots[0] as Property
  const recordPath = dataRecordValuePathFns.newInstance(property)
  const editorComponent = slotEditorRegistry.forSlot(property)
  let eventSourcedRecord = eventSourcedDataRecordFns.fromRecord([model.model], record)
  const editorClient: DataRecordEditorClient = {
    createNewRecord(modelId: ModelId): Promise<DataRecord | null> {
      throw new Error('Method not implemented')
    },

    dispatchControlEvent(event: DataRecordControlEvent): void {
      throw new Error('Method not implemented')
    },

    dispatchEditEvent(event: DataRecordEditEvent): void {
      eventSourcedRecord = eventSourcedDataRecordFns.addEvent(
        systemConfiguration,
        event,
        eventSourcedRecord,
      )
      onValueProvided(eventSourcedRecord.record.values[property.id.value])
    },

    searchRecords(modelId: ModelId, search: string): Promise<DataRecord[]> {
      throw new Error('Method not implemented')
    },

    getModelViews(modelId: ModelId): ModelView[] {
      throw new Error('Method not implemented')
    },

    getModels(): Model[] {
      throw new Error('Method not implemented')
    },

    uploadAttachments(
      files: File[],
      progressUpdater: (percent: number) => void,
    ): Promise<UploadedAttachment[]> {
      throw new Error('Method not implemented')
    },

    deleteAttachments(attachmentIds: string[]): Promise<void> {
      throw new Error('Method not implemented')
    },

    getAttachmentViewUrls(attachments: AttachmentIdAndFileName[]): Promise<string[]> {
      throw new Error('Method not implemented')
    },
  }

  return { model: model.model, record, recordPath, editorComponent, editorClient }
}

export interface FilledFilterInstance {
  _type: 'filled.filter.instance'
  dottedIdLhs: string
  rhsValue: any
  operation: FilterOperator
}

export interface FilledFilterInstanceGroup {
  _type: 'filled.filter.instance.group'
  conjunction: 'and' | 'or'
  instances: FilledFilterInstance[]
}

export function toFilledFilterInstanceGroup(fgl: FilterGroupList): FilledFilterInstanceGroup {
  if (fgl.groups.length !== 1) {
    throw new Error('Only one group is supported')
  }
  const firstGroup = fgl.groups[0]
  if (firstGroup.contents._type !== 'filter.instance.list') {
    throw new Error('Only filter.instance.list is supported')
  }
  const filterInstances: FilterInstanceList = firstGroup.contents
  return {
    _type: 'filled.filter.instance.group',
    conjunction: firstGroup.contents.conjunction,
    instances: filterInstances.filters.map((filter) => {
      if (filter.selectedLhsOption === null) {
        throw new Error('No selected lhs option')
      }
      if (filter.selectedOperatorOption === null) {
        throw new Error('No selected operator option')
      }
      let rhsValue = null
      if (filter.selectedOperatorOption.requiresRhs) {
        if (filter.rhsValue === null) {
          throw new Error('No rhs value')
        }
        if (filter.rhsValue._type === 'user.supplied.rhs.option.with.value') {
          rhsValue = filter.rhsValue.value.value
        } else {
          throw new Error('Only user.supplied.rhs.option.with.value is supported')
        }
      }
      return {
        _type: 'filled.filter.instance',
        dottedIdLhs: filter.selectedLhsOption.id,
        rhsValue,
        operation: filter.selectedOperatorOption,
      }
    }),
  }
}
