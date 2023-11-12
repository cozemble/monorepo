import { redirect, type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { ROUTES } from '$lib/utils'
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

  if (path === ROUTES.SIGN_IN || path === ROUTES.SIGN_UP) {
    if (session) {
      throw redirect(303, ROUTES.HOME)
    }
  }

  if (path === ROUTES.SIGN_OUT) {
    if (!session) {
      throw redirect(303, ROUTES.SIGN_IN)
    }
  }

  if (path.startsWith(ROUTES.DASHBOARD)) {
    if (!session) {
      throw redirect(303, ROUTES.SIGN_IN)
    }
  }

  return resolve(event)
}

export const handle = sequence(supabaseHandler, routeProtectionHandler)
