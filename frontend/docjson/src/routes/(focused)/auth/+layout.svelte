<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'

  import user from '$lib/stores/user'
  import { page } from '$app/stores'

  // <!-- TODO make sure if this is a good way to handle access -->

  onMount(() => {
    const path = $page.url.pathname

    if (path === '/auth/sign-out') return

    if (!$user.isGuest) goto('/dashboard')
  })
</script>

<slot />
