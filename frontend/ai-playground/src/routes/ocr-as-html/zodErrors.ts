import { derived, type Readable, type Writable } from 'svelte/store'
import type { FomIssue } from '@cozemble/frontend-cozemble-forms'
import { z, type ZodType } from 'zod'

export function zodErrors<T = any>(type: ZodType<T>, thing: Writable<T>): Readable<FomIssue[]> {
  return derived(thing, (o) => {
    try {
      type.parse(o)
      return []
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return error.errors
      } else {
        console.error('Some other error:', error)
        return []
      }
    }
  })
}
