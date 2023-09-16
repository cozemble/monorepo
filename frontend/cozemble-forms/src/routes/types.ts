import type { FomArray, FomDiscriminatedUnion, FomObject, FomSchema } from '$lib/fom/Fom'

import { z } from 'zod'

export const labelTable = z.object({
  action: z.literal('labelTable'),
  tableLabel: z.string().min(1, { message: 'Required' }),
  tableHasHeader: z.boolean(),
  criteria: z
    .array(
      z.object({
        logicalOperator: z.enum(['and', 'or']).default('and'),
        terms: z
          .array(
            z.object({
              type: z.enum(['headerMatches', 'columnMatches', 'cellMatches']),
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

export const mergeTables = z.object({
  action: z.literal('mergeTables'),
  tableLabel: z.string().min(1, { message: 'Required' }),
  tableHasHeader: z.boolean(),
})

const rowRangeSelector = z.object({
  type: z.literal('rowRangeSelector'),
  start: z.number().int().min(0, { message: 'Must be at least 0' }),
  end: z.number().int().min(0, { message: 'Must be at least 0' }),
})

const rowRegexSelector = z.object({
  type: z.literal('rowRegexSelector'),
  regex: z.string().min(1, { message: 'Must be at least 1 character long' }),
})

export const extractRows = z.object({
  action: z.literal('extractRows'),
  sourceTableLabel: z.string().min(1, { message: 'Required' }),
  targetTableLabel: z.string().min(1, { message: 'Required' }),
  rowSelector: z.discriminatedUnion('type', [rowRangeSelector, rowRegexSelector]),
})

export const outlineSection = z.object({
  action: z.literal('outlineSection'),
  sectionLabel: z.string().min(1, { message: 'Required' }),
  left: z.string().min(1, { message: 'Required' }),
  leftIsInclusive: z.boolean().default(true),
  top: z.string().min(1, { message: 'Required' }),
  topIsInclusive: z.boolean().default(true),
  right: z.string().optional(),
  rightIsInclusive: z.boolean().default(true),
  bottom: z.string().optional(),
  bottomIsInclusive: z.boolean().default(true),
})

export const action = z.discriminatedUnion('action', [
  labelTable,
  deleteRows,
  mergeTables,
  extractRows,
  outlineSection,
])
export const actions = action.array()

export type LabelTable = z.infer<typeof labelTable>
export type DeleteRows = z.infer<typeof deleteRows>
export type MergeTables = z.infer<typeof mergeTables>
export type ExtractRows = z.infer<typeof extractRows>
export type OutlineSection = z.infer<typeof outlineSection>
export type Action = z.infer<typeof action>
export type Actions = z.infer<typeof actions>

export type FormSchemaExtender = (schema: FomSchema, value: any) => FomSchema

export const extendSchema: FormSchemaExtender = (schema, actions) => {
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
