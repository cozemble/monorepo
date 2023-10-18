import { type Readable, derived } from 'svelte/store'
import type { Session } from '@supabase/supabase-js'
import { page } from '$app/stores'

interface UserDetails {
  id: string
  name: string
  email?: string
}

type User =
  | {
      session: Session
      isGuest: false
      details: UserDetails
    }
  | {
      session: null
      isGuest: true
      details: null
    }

// TODO user settings

/**
 * A utility store to get the user details
 * - session: session data from supabase
 * - isGuest: true if session is null
 * - details: user details
 */
const user: Readable<User> = derived([page], ([$page]) => {
  const session = $page?.data?.session ?? null

  if (!session)
    return {
      session,
      isGuest: true as const,
      details: null,
    }

  const details = {
    id: session.user.id,
    name: session.user.user_metadata.name as string,
    email: session.user.email,
  }

  return {
    session,
    isGuest: false as const,
    details,
  }
})

export default user
