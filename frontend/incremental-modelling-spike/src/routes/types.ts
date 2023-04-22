import { uuids } from '@cozemble/lang-util'

export interface NestedModel {
  name: string
  pluralName: string
  model: Model
}

export interface Model {
  name: string
  fields: string[]
  nestedModels: NestedModel[]
}

export interface DataRecord {
  id: string
  values: { [key: string]: any }
}

export const modelFns = {
  newInstance(name: string): Model {
    return { name, fields: [], nestedModels: [] }
  },
  addField(model: Model, field: string): Model {
    return { ...model, fields: [...model.fields, field] }
  },
  addNestedModel(model: Model, name: string, pluralName: string): Model {
    let nestedModel = modelFns.newInstance(name)
    nestedModel = modelFns.addField(nestedModel, 'Field 1')

    return {
      ...model,
      nestedModels: [...model.nestedModels, { name, pluralName, model: nestedModel }],
    }
  },
  renameField(model: Model, originalFieldName: string, editingFieldName: string): Model {
    return {
      ...model,
      fields: model.fields.map((field) => (field === originalFieldName ? editingFieldName : field)),
    }
  },
  deleteField(model: Model, editingFieldName: string): Model {
    return {
      ...model,
      fields: model.fields.filter((field) => field !== editingFieldName),
    }
  },
}

export const dataRecordFns = {
  newInstance(): DataRecord {
    return { id: uuids.v4(), values: {} }
  },
}
