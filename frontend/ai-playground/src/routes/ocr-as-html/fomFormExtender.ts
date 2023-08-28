import type { Action } from './ocrCorrectiveActions'
import type {
  FomArray,
  FomDiscriminatedUnion,
  FomObject,
  FomSchema,
} from '@cozemble/frontend-cozemble-forms'

export const extendSchema = (schema: FomArray, actions: Action[]): FomArray => {
  const tableLabels = (actions ?? [])
    .filter((action) => action.action === 'labelTable')
    .map((action) => action.tableLabel)
    .filter((label) => label !== undefined)
  if (tableLabels.length > 0) {
    const arraySchema = schema as FomArray
    const arrayElement = arraySchema.element as FomDiscriminatedUnion
    const mutatedOptions = arrayElement.options.map((option, index) => {
      if (index === 1) {
        const item = option as FomObject
        return {
          ...item,
          properties: { ...item.properties, tableLabel: { type: 'enum', options: tableLabels } },
        }
      }
      return option
    }) as FomSchema[]
    return { ...arraySchema, element: { ...arrayElement, options: mutatedOptions } } as FomArray
  }

  return schema
}
