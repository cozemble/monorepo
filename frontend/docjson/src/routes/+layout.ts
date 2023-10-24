import '$lib/styles/global.css'

import { env } from '$env/dynamic/public'
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit'
import type { Database } from '$lib/types/database.types'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends('supabase:auth')

  const supabaseUrl = env.PUBLIC_SUPABASE_URL
  const supabaseKey = env.PUBLIC_SUPABASE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_KEY')
  }

  const supabase = createSupabaseLoadClient<Database>({
    supabaseUrl,
    supabaseKey,
    event: { fetch },
    serverSession: data.session,
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return { supabase, session }
}
