<script lang="ts">
  import { page } from '$app/stores'
  import { onMount } from 'svelte'
  import UpdatePasswordForm from './UpdatePasswordForm.svelte'
  import user from '$lib/stores/user'
  import { goto } from '$app/navigation'

  $: supabase = $page.data.supabase

  onMount(async () => {
    const code = $page.url.searchParams.get('code')

    const unauthorized = !code && $user.isGuest

    // <!-- TODO unify all authorization rules to prevent duplications and collisions -->
    if (unauthorized) {
      goto('/auth/sign-in')
      return
    }

    // <!-- TODO make sure if this is the right place to do this -->
    // call the Supabase API to exchange the code for a session
    if (code) await supabase.auth.exchangeCodeForSession(code)
  })
</script>

<div
  class="card w-full sm:w-[30rem] lg:w-[35rem] md:mt-10 flex flex-col items-center justify-center"
>
  <h1
    class="text-center 
    text-3xl mb-4
    md:text-4xl md:mb-6
    "
  >
    Reset Password
  </h1>

  <p class="mb-10 lg:mb-14 text-center text-sm md:text-base lg:text-lg opacity-60">
    Enter your new password
  </p>

  <UpdatePasswordForm />
</div>
