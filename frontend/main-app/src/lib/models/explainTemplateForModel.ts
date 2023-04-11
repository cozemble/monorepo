import type { Model, Property } from '@cozemble/model-core'

export function explainTemplateForModel(model: Model): string {
  const properties = model.slots.filter((s) => s._type === 'property') as Property[]
  if (properties.length === 0) {
    return `No properties for model ${model.name.value}, so not possible to make a summary view yet`
  }
  if (properties.length === 1) {
    return `Example: <strong>{{${properties[0].name.value}}}</strong>`
  }
  const [property1, property2] = [properties[0], properties[1]]
  return `Example: <strong>{{${property1.name.value}}}</strong><br/>{{${property2.name.value}}}`
}
