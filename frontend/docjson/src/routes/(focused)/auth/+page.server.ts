import { AuthApiError } from '@supabase/supabase-js'
import { fail, type Actions, redirect } from '@sveltejs/kit'

// TODO move these actions to relevant files
export const actions: Actions = {
  signin: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error: AuthError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (AuthError) {
      if (AuthError instanceof AuthApiError && [400].includes(AuthError.status)) {
        return fail(400, {
          error: 'Invalid credentials',
          values: { email },
        })
      }

      return fail(500, {
        error: 'Server error, Try again later.',
        values: { email },
      })
    }

    throw redirect(303, '/dashboard')
  },

  signout: async ({ locals: { supabase } }) => {
    await supabase.auth.signOut()
    throw redirect(303, '/')
  },

  signup: async ({ request, url, locals: { supabase } }) => {
    const formData = await request.formData()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const termAndCondition = formData.get('term')

    // validate email

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${url.origin}/auth/callback`,
      },
    })

    if (error) {
      return fail(500, {
        message: 'Server error. Try again later',
        success: false,
        email,
      })
    }

    return {
      message: 'Please check your email for a magic link to log into the website',
      success: true,
    }
  },
}
