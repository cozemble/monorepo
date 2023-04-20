import { uuids } from '@cozemble/lang-util'

export interface NestedModel {
  name: string
  model: Model
}

export interface Model {
  fields: string[]
  nestedModels: NestedModel[]
}

export interface DataRecord {
  id: string
  values: { [key: string]: any }
}

export const modelFns = {
  newInstance(): Model {
    return { fields: [], nestedModels: [] }
  },
  addField(model: Model, field: string): Model {
    return { ...model, fields: [...model.fields, field] }
  },
  addNestedModel(model: Model, name: string): Model {
    return {
      ...model,
      nestedModels: [...model.nestedModels, { name, model: modelFns.newInstance() }],
    }
  },
}

export const dataRecordFns = {
  newInstance(): DataRecord {
    return { id: uuids.v4(), values: {} }
  },
}
