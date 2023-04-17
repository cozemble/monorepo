import type { Model, Property } from '@cozemble/model-core'

interface Message {
  _type: 'message'
  message: string
}

interface Example {
  _type: 'example'
  example: string
}

export type Explain = Message | Example

export function explainTemplateForModel(model: Model): Explain {
  const properties = model.slots.filter((s) => s._type === 'property') as Property[]
  if (properties.length === 0) {
    return {
      _type: 'message',
      message: `No properties for model ${model.name.value}, so not possible to make a summary view yet`,
    }
  }
  if (properties.length === 1) {
    return {
      _type: 'example',
      example: `<strong>{{${properties[0].name.value}}}</strong>`,
    }
  }
  const [property1, property2] = [properties[0], properties[1]]
  return {
    _type: 'example',
    example: `<strong>{{${property1.name.value}}}</strong><br/>{{${property2.name.value}}}`,
  }
}
