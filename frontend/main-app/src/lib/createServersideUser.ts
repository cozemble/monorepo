import type { PublicSchema, User } from './supabase/flattened_types'
import type { ErrorMessage, Value } from '@cozemble/lang-util'
import { justErrorMessage, value } from '@cozemble/lang-util'
import type { Database } from './supabase/db_types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthUser } from '@supabase/supabase-js'
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js'

async function insertResponse<T extends Record<string, unknown> = Record<string, unknown>>(
  statement: PostgrestFilterBuilder<PublicSchema, T, T>,
): Promise<Value<any> | ErrorMessage> {
  const { data, error } = await statement
  if (error) {
    return justErrorMessage(error.message)
  }
  return value(data[0])
}

export async function createServersideUser(
  supabase: SupabaseClient<Database>,
  authUser: AuthUser,
  firstName: string,
): Promise<Value<User> | ErrorMessage> {
  const userInsertOutcome = await insertResponse<User>(
    supabase.from('users').insert([{ supabase_id: authUser.id, first_name: firstName }]) as any, // just too tired
  )
  if (userInsertOutcome._type === 'just.error.message') {
    return userInsertOutcome
  }
  const organisationInsertOutcome = await insertResponse(
    supabase.from('organizations').insert([{ name: 'My Organization', owner_id: authUser.id }]),
  )
  if (organisationInsertOutcome._type === 'just.error.message') {
    return organisationInsertOutcome
  }
  const memberInsertOutcome = await insertResponse(
    supabase.from('organization_members').insert([
      {
        user_id: authUser.id,
        organization_id: organisationInsertOutcome.value.id,
        roles: ['owner'],
      },
    ]),
  )
  if (memberInsertOutcome._type === 'just.error.message') {
    return memberInsertOutcome
  }
  const projectInsertOutcome = await insertResponse(
    supabase
      .from('projects')
      .insert([{ name: 'My Project', organisation_id: organisationInsertOutcome.value.id }]) as any, // just too tired
  )
  if (projectInsertOutcome._type === 'just.error.message') {
    return projectInsertOutcome
  }
  const { data: users, error } = await supabase
    .from('users')
    .select()
    .eq('supabase_id', authUser.id)
  if (error) {
    return justErrorMessage(error.message)
  }
  return value(users[0])
}
