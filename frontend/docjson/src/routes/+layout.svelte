<script lang="ts">
  import { invalidate } from '$app/navigation'
  import { onMount } from 'svelte'

  export let data

  $: ({ supabase, session } = data)

  // Reload layout load functions whenever the session updates to keep the page store in sync
  onMount(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, _session) => {
      if (_session?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth')
      }
    })

    return () => subscription.unsubscribe()
  })
</script>

<slot />
