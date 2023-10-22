<script lang="ts">
  import type { EventHandler } from 'svelte/elements'
  import { writable } from 'svelte/store'
  import { z } from 'zod'

  import { page } from '$app/stores'
  import notifications from '$lib/stores/notifications'
  import FormInput from '$lib/components/form/FormInput.svelte'

  $: supabase = $page.data.supabase

  const Schema = z.object({
    name: z
      .string()
      .min(4, 'Name should be longer than 4 characters')
      .max(24, 'Name should be shorter than 24 characters'),
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(8, 'Password should be minimum 8 characters'),
  })

  type Values = z.infer<typeof Schema>

  let values: Values = {
    name: '',
    email: '',
    password: '',
  }

  let errors = writable<Partial<Values>>({})

  const onSubmit: EventHandler = async () => {
    // Validation

    errors.set({})

    const validation = Schema.safeParse(values)

    if (!validation.success) {
      const errs = validation.error.flatten().fieldErrors
      errors.set({
        name: errs.name?.[0],
        email: errs.email?.[0],
        password: errs.password?.[0],
      })

      return
    }

    // Send request

    const loadingNotification = notifications.create({
      title: 'Signing up',
      description: 'Please wait while we sign you up',
      type: 'loading',
      canUserClose: false,
    })

    // <!-- TODO bring in their guest data -->
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { name: values.name },
        emailRedirectTo: `https://tojson.dev/auth/callback`,
      },
    })

    loadingNotification.remove()

    // Response handling

    if (error) {
      notifications.create({
        title: 'Error',
        description: error.message,
        type: 'error',
        duration: 5000,
      })

      return
    }

    // <!-- TODO determine if this is the best way to tell user to check their email -->
    notifications.create({
      title: 'Success',
      description: 'Please check your email to verify your account',
      type: 'success',
      canUserClose: true,
    })
  }
</script>

<!-- method is set to post just in case to prevent security issues -->
<form method="post" on:submit|preventDefault={onSubmit}>
  <FormInput name="name" bind:value={values.name} error={$errors?.name} placeholder="Your Name" />

  <FormInput
    name="email"
    bind:value={values.email}
    error={$errors?.email}
    placeholder="you@example.com"
  />

  <FormInput
    name="password"
    bind:value={values.password}
    error={$errors?.password}
    placeholder="••••••••"
    type="password"
  />

  <div class="flex flex-col items-center mt-6">
    <button class="btn btn-primary w-full">Sign up</button>
  </div>
</form>
