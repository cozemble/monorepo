import { PUBLIC_SUPABASE_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit'
import type { Database } from '$lib/types/database.types'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createSupabaseServerClient<Database>({
    supabaseKey: PUBLIC_SUPABASE_KEY,
    supabaseUrl: PUBLIC_SUPABASE_URL,
    event,
  })

  event.locals.getSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession()
    return session
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range'
    },
  })
}

// Add more handlers
// export const handle = sequence(handleSession)
