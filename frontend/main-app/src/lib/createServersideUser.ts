import type { PublicSchema, User } from './supabase/flattened_types'
import type { ErrorMessage, Value } from '@cozemble/lang-util'
import { justErrorMessage, uuids, value } from '@cozemble/lang-util'
import type { Database } from './supabase/db_types'
import type { AuthUser, SupabaseClient } from '@supabase/supabase-js'
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js'

async function insertResponse<T extends Record<string, unknown> = Record<string, unknown>>(
  statement: PostgrestFilterBuilder<PublicSchema, T, T>,
): Promise<Value<boolean> | ErrorMessage> {
  const { data, error } = await statement
  console.log({ data, error })
  if (error) {
    return justErrorMessage(error.message)
  }
  return value(true)
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

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select()
    .eq('supabase_id', authUser.id)
  if (usersError) {
    return justErrorMessage(usersError.message)
  }
  if (users === null || users.length !== 1) {
    return justErrorMessage('Could not find user')
  }
  const user = users[0]

  const orgId = uuids.v4()
  const organisationInsertOutcome = await insertResponse(
    supabase
      .from('organisations')
      .insert([{ name: 'My Organisation', owning_user_id: user.id, client_id: orgId }]) as any,
  )
  if (organisationInsertOutcome._type === 'just.error.message') {
    return organisationInsertOutcome
  }
  const { data: organisations, error } = await supabase
    .from('organisations')
    .select()
    .eq('client_id', orgId)
  if (error) {
    return justErrorMessage(error.message)
  }
  const organisation = organisations[0]
  const memberInsertOutcome = await insertResponse(
    supabase.from('organisation_users').insert([
      {
        user_id: user.id,
        organisation_id: organisation.id,
        roles: ['owner'],
      },
    ]) as any,
  )
  if (memberInsertOutcome._type === 'just.error.message') {
    return memberInsertOutcome
  }
  const projectInsertOutcome = await insertResponse(
    supabase
      .from('projects')
      .insert([
        { name: 'My Project', organisation_id: organisation.id, client_id: uuids.v4() },
      ]) as any, // just too tired
  )
  if (projectInsertOutcome._type === 'just.error.message') {
    return projectInsertOutcome
  }
  return value(user)
}
