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

export const apportionColumnContents = z.object({
  action: z.literal('apportionColumnContents'),
  tableLabel: z.string().min(1, { message: 'Required' }),
  sourceColumnName: z.string().min(1, { message: 'Required' }),
  apportioningRegex: z.string().min(1, { message: 'Required' }),
  keyColumnName: z.string().min(1, { message: 'Required' }),
})

export const action = z.discriminatedUnion('action', [
  labelTable,
  deleteRows,
  mergeTables,
  extractRows,
  apportionColumnContents,
])
export const actions = action.array()

export type LabelTable = z.infer<typeof labelTable>
export type DeleteRows = z.infer<typeof deleteRows>
export type MergeTables = z.infer<typeof mergeTables>
export type ExtractRows = z.infer<typeof extractRows>
export type ApportionColumnContents = z.infer<typeof apportionColumnContents>
export type Action = z.infer<typeof action>
export type Actions = z.infer<typeof actions>
