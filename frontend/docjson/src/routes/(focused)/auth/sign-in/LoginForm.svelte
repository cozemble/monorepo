<script lang="ts">
  import type { EventHandler } from 'svelte/elements'
  import { writable } from 'svelte/store'
  import { AuthApiError } from '@supabase/supabase-js'
  import { z } from 'zod'

  import { goto } from '$app/navigation'
  import { page } from '$app/stores'

  import notifications from '$lib/stores/notifications'
  import FormInput from '$lib/components/form/FormInput.svelte'

  $: supabase = $page.data.supabase

  const Schema = z.object({
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(8, 'Password should be minimum 8 characters'),
  })

  type Values = z.infer<typeof Schema>

  let values: Values = {
    email: '',
    password: '',
  }

  let errors = writable<Partial<Values>>({})

  // let helperText: HelperText = { error: false, text: null }

  //

  const onSubmit: EventHandler = async () => {
    // Validation

    errors.set({})

    const validation = Schema.safeParse(values)

    if (!validation.success) {
      const errs = validation.error.flatten().fieldErrors
      errors.set({
        email: errs.email?.[0],
        password: errs.password?.[0],
      })

      return
    }

    // Send request

    const loadingNotification = notifications.create({
      text: 'Signing in',
      description: 'Please wait while we sign you in',
      type: 'loading',
      isClosable: false,
    })

    const { error: AuthError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    // Response handling

    loadingNotification.handleClose()

    if (AuthError) {
      const areCredentialsInvalid = AuthError.name

      if (areCredentialsInvalid) {
        notifications.create({
          text: 'Error',
          description: 'Invalid email or password. Please try again.',
          type: 'error',
          duration: 5000,
        })

        values.password = ''
        errors.set({ password: 'Invalid email or password' })

        return
      }

      return notifications.create({
        text: 'Error',
        description: 'An error occurred while signing in. Please try again.',
        type: 'error',
        duration: 5000,
      })
    }

    // Success

    // <!-- TODO determine if this is the best way to tell user to check their email -->
    notifications.create({
      text: 'Success',
      description: 'Sign in successful.',
      type: 'success',
      duration: 5000,
    })

    goto('/')
  }
</script>

<!-- method is set to post just in case to prevent security issues -->
<form method="post" on:submit|preventDefault={onSubmit}>
  <FormInput
    name="email"
    bind:value={values.email}
    error={$errors.email}
    placeholder="you@example.com"
  />

  <FormInput
    name="password"
    bind:value={values.password}
    error={$errors.password}
    placeholder="••••••••"
    type="password"
  />

  <!-- Forgot password button -->
  <a
    href="/auth/forgot-password"
    class="label-text-alt link-hover text-sm opacity-50 hover:opacity-70">Forgot password?</a
  >

  <div class="flex flex-col items-center mt-6">
    <button type="submit" class="btn btn-primary w-full">Sign in</button>
  </div>
</form>
