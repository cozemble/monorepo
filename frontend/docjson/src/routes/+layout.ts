import '$lib/styles/global.css'

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } from '$env/static/public'
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit'
import type { Database } from '$lib/types/database.types'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends('supabase:auth')

  const supabase = createSupabaseLoadClient<Database>({
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_KEY,
    event: { fetch },
    serverSession: data.session,
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return { supabase, session }
}
