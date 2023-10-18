<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import notifications from '$lib/stores/notifications'
  import { onMount } from 'svelte'

  $: supabase = $page.data.supabase

  onMount(async () => {
    const loadingNotification = notifications.create({
      text: 'Signing out',
      description: 'Please wait while we sign you out',
      type: 'loading',
      isClosable: false,
    })

    const { error } = await supabase.auth.signOut()

    loadingNotification.handleClose()

    if (error) {
      notifications.create({
        text: 'Error',
        description: 'An error occurred while signing out. Please try again.',
        type: 'error',
        isClosable: true,
      })

      goto('/')

      return
    }

    notifications.create({
      text: 'Success',
      description: 'Signed out successfully',
      type: 'info',
      duration: 5000,
    })

    goto('/')
  })
</script>

<div class="flex flex-grow w-full h-full items-center justify-center">
  <h1>Signing out</h1>
  <span class="ml-4 loading loading-dots loading-lg" />
</div>
