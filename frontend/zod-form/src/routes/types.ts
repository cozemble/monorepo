import { z } from 'zod'
import type { FomArray, FomDiscriminatedUnion, FomObject, FomSchema } from '$lib/fom/Fom'
import { objects } from '@cozemble/lang-util'
import type { Path } from '$lib/fom/components/helper'

export const labelTable = z.object({
  action: z.literal('labelTable'),
  tableLabel: z.string().min(1, { message: 'Required' }),
  criteria: z
    .array(
      z.object({
        logicalOperator: z.enum(['and', 'or']).default('and'),
        terms: z
          .array(
            z.object({
              type: z.enum(['header_matches', 'column_matches', 'cell_matches']),
              regex: z.string().min(1, { message: 'regex must be at least 1 characters' }),
            }),
          )
          .nonempty(),
      }),
    )
    .nonempty(),
})

export const deleteRows = z.object({
  action: z.literal('deleteRows'),
  tableLabel: z.string().min(1, { message: 'Required' }),
  rowRegex: z.string().min(1, { message: 'Must be at least 1 character long' }),
})

export const actions = z.discriminatedUnion('action', [labelTable, deleteRows]).array()

export type FormElementMaker = (
  zod: z.ZodType<any, any>,
  value: any,
  path: Path,
  schemaPath: z.ZodType<any, any>[],
) => FomSchema | null

export const noopFormElementMaker: FormElementMaker = () => null

export const learningFormElementMaker: FormElementMaker = (zod, actions, path, schemaPath) => {
  const tableLabels = (actions ?? [])
    .filter((action) => action.action === 'labelTable')
    .map((action) => action.label)
    .filter((label) => label !== undefined)
  if (path.join('.') === 'tableLabel') {
    const valueAtPath = objects.walkTo(actions, ...path.map((i) => i.toString()))
    console.log({ tableLabels, schemaPath, path, valueAtPath, actions })
    return {
      type: 'enum',
      options: tableLabels,
    }
  }
  return null
}

export type FormSchemaExtender = (schema: FomSchema, value: any) => FomSchema

export const noopFormSchemaExtender: FormSchemaExtender = (schema) => schema

export const extendSchema: FormSchemaExtender = (schema, actions) => {
  console.log('extendSchema', { schema, actions })
  const tableLabels = (actions ?? [])
    .filter((action) => action.action === 'labelTable')
    .map((action) => action.tableLabel)
    .filter((label) => label !== undefined)
  if (tableLabels.length > 0) {
    console.log({ tableLabels, schema })
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
    // return { ...schema, element: { ...schema.element, options:  }
  }

  return schema
}
