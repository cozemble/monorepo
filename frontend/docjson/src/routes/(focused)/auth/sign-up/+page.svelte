<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'

  import user from '$lib/stores/user'
  import SignupForm from './SignupForm.svelte'
  import OAuthProviders from '../OAuthProviders.svelte'

  export let form: Record<string, string>

  $: supabase = $page?.data?.supabase

  onMount(() => {
    if (!$user.isGuest) goto('/dashboard')
  })
</script>

<!-- TODO LATER heading typing animation change -->

<section
  class="w-full flex-grow flex flex-col md:flex-row gap-6 md:gap-20 lg:gap-[15vw] items-center justify-center"
>
  <div class="text-center md:text-start">
    <h1 class="lg:text-5xl xl:text-6xl 2xl:text-7xl mb-4 ">Welcome back!</h1>
    <p class="lg:text-xl opacity-50 tracking-tighter">
      Sign in or create an account to get started.
    </p>
  </div>

  <div
    class="w-96 p-8 py-10 rounded-xl
     shadow-xl
     glass bg-base-300/30 border-2 border-solid border-base-300
     "
  >
    <h2 class="mb-8">Sign up</h2>

    <SignupForm {form} />

    <div class="divider my-10 text-base-content/40">or</div>
    <OAuthProviders {supabase} />
  </div>
</section>
