import { uuids } from '@cozemble/lang-util'

export type Cardinality = 'one' | 'many'
export interface NestedModel {
  name: string
  model: Model
  cardinality: Cardinality
}

export interface Model {
  id: string
  name: string
  pluralName: string
  fields: string[]
  nestedModels: NestedModel[]
}

export interface DataRecord {
  id: string
  values: { [key: string]: any }
}

export const modelFns = {
  newInstance(name: string, pluralName: string): Model {
    return { id: uuids.v4(), name, pluralName, fields: [], nestedModels: [] }
  },
  addField(model: Model, field: string): Model {
    return { ...model, fields: [...model.fields, field] }
  },
  addNestedModel(cardinality: Cardinality, model: Model, name: string, pluralName: string): Model {
    let nestedModel = modelFns.newInstance(name, pluralName)
    nestedModel = modelFns.addField(nestedModel, 'Field 1')

    return {
      ...model,
      nestedModels: [...model.nestedModels, { cardinality, name, model: nestedModel }],
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
