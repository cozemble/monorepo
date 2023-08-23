import { z } from 'zod'
import type { FormArray, FormDiscriminatedUnion, FormObject, FormSchema } from '$lib/types/Schema'
import type { Path } from '$lib/containers/helper'
import { objects } from '@cozemble/lang-util'

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
) => FormSchema | null

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

export type FormSchemaExtender = (schema: FormSchema, value: any) => FormSchema

export const noopFormSchemaExtender: FormSchemaExtender = (schema) => schema

export const extendSchema: FormSchemaExtender = (schema: FormSchema, actions) => {
  console.log('extendSchema', { schema, actions })
  const tableLabels = (actions ?? [])
    .filter((action) => action.action === 'labelTable')
    .map((action) => action.tableLabel)
    .filter((label) => label !== undefined)
  if (tableLabels.length > 0) {
    console.log({ tableLabels, schema })
    const arraySchema = schema as FormArray
    const arrayElement = arraySchema.element as FormDiscriminatedUnion
    const mutatedOptions = arrayElement.options.map((option, index) => {
      if (index === 1) {
        const item = option as FormObject
        return {
          ...item,
          properties: { ...item.properties, tableLabel: { type: 'enum', options: tableLabels } },
        }
      }
      return option
    }) as FormSchema[]
    return { ...arraySchema, element: { ...arrayElement, options: mutatedOptions } } as FormArray
    // return { ...schema, element: { ...schema.element, options:  }
  }

  return schema
}

export function zodToFormSchema(zod: z.ZodType<any, any>): FormSchema {
  if (zod instanceof z.ZodObject) {
    return {
      type: 'object',
      properties: Object.fromEntries(
        Object.entries(zod.shape).map(([k, v]) => {
          if (v instanceof z.ZodType) {
            return [k, zodToFormSchema(v)]
          }
          throw new Error(`Unsupported zod type ${v}`)
        }),
      ),
    }
  } else if (zod instanceof z.ZodArray) {
    return {
      type: 'array',
      element: zodToFormSchema(zod.element),
    }
  } else if (zod instanceof z.ZodDiscriminatedUnion) {
    const discriminator = zod._def.discriminator
    const options = zod._def.options

    return {
      type: 'discriminatedUnion',
      discriminator,
      options: options.map((option) => zodToFormSchema(option)),
    }
  } else if (zod instanceof z.ZodLiteral) {
    return {
      type: 'literal',
      value: zod._def.value,
    }
  } else if (zod instanceof z.ZodEnum) {
    return {
      type: 'enum',
      options: zod._def.values,
    }
  } else if (zod instanceof z.ZodDefault) {
    return {
      type: 'default',
      value: zod._def.defaultValue,
      innerSchema: zodToFormSchema(zod._def.innerType),
    }
  } else if (zod instanceof z.ZodString) {
    return {
      type: 'text',
    }
  } else {
    throw new Error(`Unsupported zod type ${zod}`)
  }
}
