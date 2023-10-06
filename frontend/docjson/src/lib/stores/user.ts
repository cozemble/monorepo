// TODO user settings
// TODO user API keys

import { writable, type Readable, derived } from 'svelte/store'
import type { Session } from '@supabase/supabase-js'
import { page } from '$app/stores'

interface UserDetails {
  id: string
  name: string
  email: string
  // TODO rest of the details
}
interface User {
  session: Session | null
  isGuest: boolean
  details: UserDetails
}

//

const session: Readable<Session | null> = derived(page, ($page) => {
  return $page?.data?.session ?? null
})

// TODO fetch user details from supabase
const details = writable<UserDetails>({
  id: 'mock-user',
  name: 'Mock User',
  email: 'mock@user.com',
})

/**
 * A unified store for user data that combines:
 * - session: session data from supabase
 * - isGuest: true if session is null
 * - details: user details
 */
const user: Readable<User> = derived([session, details], ([$session, $details]) => {
  const isGuest = $session ? false : true

  return {
    session: $session,
    isGuest,
    details: $details,
  }
})

export default user
