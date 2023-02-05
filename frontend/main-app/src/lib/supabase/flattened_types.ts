import type { AuthUser } from '@supabase/supabase-js'

import type { Database } from './db_types'

export type User = Database['public']['Tables']['users']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type OrganisationUser = Database['public']['Tables']['organisation_users']['Row']
export type Organisation = Database['public']['Tables']['organisations']['Row']
export type PublicSchema = Database['public']

export type CombinedUser = { user: User; authUser: AuthUser }
