import { redirect, type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit'

import { PUBLIC_SUPABASE_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import type { Database } from '$lib/types/database.types'

const supabaseHandler: Handle = async ({ event, resolve }) => {
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

/** Handle route protection, should be run after supabaseHandler */
const routeProtectionHandler: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname

  const session = await event.locals.getSession()

  if (path === '/auth/sign-in' || path === '/auth/sign-up' || path === '/auth/forgot-password') {
    if (session) {
      throw redirect(303, '/')
    }
  }

  if (path === '/auth/sign-out' || path === '/auth/reset-password') {
    if (!session) {
      throw redirect(303, '/auth/sign-in')
    }
  }

  if (path.startsWith('/dashboard')) {
    if (!session) {
      throw redirect(303, '/auth/sign-in')
    }
  }

  return resolve(event)
}

export const handle = sequence(supabaseHandler, routeProtectionHandler)
