<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'

  import user from '$lib/stores/user'

  // <!-- TODO make sure if this is a good way to handle access -->

  onMount(() => {
    if (!$user.isGuest) goto('/dashboard')
  })
</script>

<slot />
