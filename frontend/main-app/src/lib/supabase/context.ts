import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './db_types'

export type SetContext<T = any> = (key: any, value: any) => void
export type GetContext<T = any> = (key: any) => T

const contextKey = {}

export const supabaseContext = {
  set(setContext: SetContext, client: SupabaseClient<Database>) {
    setContext(contextKey, client)
  },
  get(getContext: GetContext) {
    return getContext(contextKey) as SupabaseClient<Database>
  },
}
