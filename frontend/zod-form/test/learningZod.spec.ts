import { z } from 'zod'
import { test } from 'vitest'

export const labelTable = z.object({
  action: z.literal('label.table'),
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

test('learing zod', () => {
  const criteria = labelTable.shape['criteria']
  const is = criteria.element instanceof z.ZodObject
  const logicalOperator = criteria.element.shape['logicalOperator']
  console.log('labelTable', labelTable)
})
