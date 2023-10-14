<script lang="ts">
  import { z } from 'zod'

  import { page } from '$app/stores'
  import FormInput from '$lib/components/form/FormInput.svelte'
  import notifications from '$lib/stores/notifications'
  import { goto } from '$app/navigation'

  $: supabase = $page.data.supabase

  const Schema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters long'),
  })

  type Values = z.infer<typeof Schema>

  const values: Values = {
    password: '',
    confirmPassword: '',
  }

  let errors: Partial<Values> = {}

  const clearValues = () => {
    values.password = ''
    values.confirmPassword = ''
  }

  const onSubmit = async () => {
    // Validation

    errors = {}

    const validation = Schema.safeParse(values)

    if (!validation.success) {
      const errs = validation.error.flatten().fieldErrors
      errors = {
        password: errs.password?.[0],
        confirmPassword: errs.confirmPassword?.[0],
      }
      clearValues()

      return
    }

    if (values.password !== values.confirmPassword) {
      errors = {
        confirmPassword: 'Passwords do not match',
      }
      values.confirmPassword = ''

      return
    }

    // Send request

    const loadingNotification = notifications.create({
      text: 'Signing up',
      description: 'Please wait while we sign you up',
      type: 'loading',
      isClosable: false,
    })

    const { error } = await supabase.auth.updateUser({ password: values.password })

    loadingNotification.handleClose()

    // Response handling

    if (error) {
      notifications.create({
        text: 'Error',
        description: error.message,
        type: 'error',
      })

      clearValues()

      return
    }

    notifications.create({
      text: 'Success',
      description: 'Your password has been updated',
      type: 'success',
    })

    goto('/dashboard')
  }
</script>

<form method="post" on:submit|preventDefault={onSubmit}>
  <FormInput
    name="New Password"
    type="password"
    bind:value={values.password}
    error={errors?.password}
  />

  <FormInput
    name="Confirm Password"
    type="password"
    bind:value={values.confirmPassword}
    error={errors?.confirmPassword}
  />

  <button class="btn btn-primary w-full mt-2">Reset Password</button>
</form>
