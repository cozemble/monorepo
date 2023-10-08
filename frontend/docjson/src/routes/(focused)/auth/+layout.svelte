<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'

  import user from '$lib/stores/user'

  onMount(() => {
    if (!$user.isGuest) goto('/dashboard')
  })
</script>

<!-- bg-gradient-to-b from-primary/20 to-accent/50 text-base-content -->

<!-- Background decoration -->
<div class="absolute top-1/2 left-2/3 w-32 h-32 -z-40 bg-primary/80 blur-[20em] " />
<div class="absolute top-2/3 left-1/2 w-32 h-32 -z-40 bg-secondary/60 blur-[20em] " />
<div class="absolute top-1/3 left-1/3 w-32 h-32 -z-40 bg-accent/80 blur-[20em] " />

<slot />
