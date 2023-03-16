import _ from 'lodash'

export const removeFormulaFields = (record: AnyValue, model: CozJSONSchema): AnyValue => {
  // array
  if (_.isArray(record)) {
    return record.reduce((prev: ArrayValue, curr): ArrayValue => {
      const schema = model.items as CozJSONSchema

      if (schema.formula) return prev

      if (_.isObject(curr) || _.isArray(curr)) curr = removeFormulaFields(curr, schema)

      return [...prev, curr]
    }, [] as ArrayValue)
  }

  // object
  if (_.isObject(record)) {
    return Object.entries(record).reduce((prev, [key, value]) => {
      if (!model.properties) return prev // not needed but TS doesn't get it

      const schema = model.properties[key] as CozJSONSchema

      if (schema.formula) return prev

      if (_.isObject(value) || _.isArray(value))
        return {
          ...prev,
          [key]: removeFormulaFields(value, schema),
        }

      return {
        ...prev,
        [key]: value,
      }
    }, {} as ObjectValue)
  }

  // simple value
  if (model.formula) return
}
