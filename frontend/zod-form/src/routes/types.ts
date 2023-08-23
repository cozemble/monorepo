import { z } from 'zod'

export const labelTable = z.object({
  action: z.literal('labelTable'),
  label: z.string().min(1, { message: 'Required' }),
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
