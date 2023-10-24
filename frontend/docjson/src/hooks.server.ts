import { redirect, type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit'

import { env } from '$env/dynamic/public'
import type { Database } from '$lib/types/database.types'

const supabaseHandler: Handle = async ({ event, resolve }) => {
  const supabaseUrl = env.PUBLIC_SUPABASE_URL
  const supabaseKey = env.PUBLIC_SUPABASE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_KEY')
  }

  event.locals.supabase = createSupabaseServerClient<Database>({
    supabaseUrl,
    supabaseKey,
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

  if (path === '/auth/sign-in' || path === '/auth/sign-up') {
    if (session) {
      throw redirect(303, '/')
    }
  }

  if (path === '/auth/sign-out') {
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
