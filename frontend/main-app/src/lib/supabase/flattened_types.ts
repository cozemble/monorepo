import type { AuthUser } from '@supabase/supabase-js'

import type { Database } from './db_types'

export type User = Database['public']['Tables']['users']['Row']

export type CombinedUser = { user: User; authUser: AuthUser }
