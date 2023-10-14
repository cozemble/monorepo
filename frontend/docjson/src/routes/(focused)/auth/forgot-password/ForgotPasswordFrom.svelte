<script lang="ts">
  import { z } from 'zod'
  import FormInput from '$lib/components/form/FormInput.svelte'
  import { page } from '$app/stores'
  import notifications from '$lib/stores/notifications'

  $: supabase = $page.data.supabase

  const Schema = z.string().email('Please provide a valid email address')
  let value = ''
  let error = ''

  const onSubmit = async () => {
    // Validation

    error = ''

    const validation = Schema.safeParse(value)

    if (!validation.success) {
      const errs = validation.error.flatten().formErrors
      error = errs?.[0]

      return
    }

    // Send request

    const loadingNotification = notifications.create({
      text: 'Sending email',
      description: 'Please wait while we send you an email',
      type: 'loading',
      isClosable: false,
    })

    const { error: ReqError } = await supabase.auth.resetPasswordForEmail(value, {
      redirectTo: $page.url.origin + '/auth/reset-password',
    })

    loadingNotification.handleClose()

    // Handle response

    if (ReqError) {
      notifications.create({
        text: 'Error',
        description: ReqError.message,
        type: 'error',
      })

      return
    }

    notifications.create({
      text: 'Email sent',
      description: 'If you registered with this email, you will receive an email shortly',
      type: 'success',
    })
  }
</script>

<form
  method="post"
  on:submit|preventDefault={onSubmit}
  class="mt-10 lg:mt-14 w-full flex flex-col "
>
  <FormInput name="Email Address" bind:value {error} placeholder="you@example.com" />

  <!-- TODO change to a loading button -->
  <button type="submit" class="btn btn-primary mt-2"> Send</button>
</form>
