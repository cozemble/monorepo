import { redirect } from '@sveltejs/kit'

// http://tojson.dev/auth/v1/callback
export const GET = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code')
  const redirectTo = url.searchParams.get('redirectTo')

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
    throw redirect(303, redirectTo || '/dashboard')
  }

  throw redirect(303, '/auth/sign-up')
}
