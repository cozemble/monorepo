<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'

  import user from '$lib/stores/user'
  import SignupForm from './SignupForm.svelte'
  import OAuthProviders from '../OAuthProviders.svelte'

  export let form: Record<string, string>

  $: supabase = $page?.data?.supabase

  const goToLogin = () => {
    console.log('go to login')
    goto(`/auth/sign-in`)
  }

  onMount(() => {
    if (!$user.isGuest) goto('/dashboard')
  })
</script>

<!-- TODO LATER heading typing animation change -->

<section
  class="w-full flex-grow flex flex-col md:flex-row gap-6 md:gap-20 lg:gap-[10vw] items-center justify-start rounded-xl
  "
>
  <div
    class="w-[45vw] p-52 py-12 h-full
    bg-base-100/70 backdrop-blur-3xl 
    border-r border-base-300
    "
  >
    <h2 class="mb-8">Sign Up</h2>
    <!-- <h2 class="mb-2">Get Started!</h2>
    <p class="mb-8 opacity-40 text-sm tracking-tighter">
      Create an account to start using our services
    </p> -->

    <SignupForm {form} />

    <div class="divider my-8 text-base-content/40">or</div>

    <OAuthProviders {supabase} />

    <div class="divider my-5 opacity-60" />

    <div class="flex justify-center">
      <button class="link-hover text-base  opacity-70 hover:opacity-100" on:click={goToLogin}>
        already have an account yet?
      </button>
    </div>
  </div>

  <div class="text-center md:text-start">
    <h1 class="lg:text-4xl 2xl:text-5xl mb-4">Get started!</h1>
    <p class="lg:text-lg opacity-50 tracking-tighter">
      Create an account to start using our services
    </p>
  </div>
</section>
