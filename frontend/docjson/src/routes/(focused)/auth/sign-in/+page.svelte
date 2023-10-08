<script lang="ts">
  import Icon from '@iconify/svelte'

  import { page } from '$app/stores'
  import { goto } from '$app/navigation'

  import LoginForm from './LoginForm.svelte'
  import OAuthProviders from '../OAuthProviders.svelte'

  export let form: Record<string, string>

  $: supabase = $page?.data?.supabase

  const goToSignup = () => {
    goto(`/auth/sign-up`)
  }
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
    <h2 class="mb-8">Sign in</h2>

    <LoginForm {form} />

    <div class="divider my-10 text-base-content/40">or</div>

    <OAuthProviders {supabase} />

    <!-- SSO -->
    <button class="btn btn-link text-neutral w-full mt-3">
      <Icon icon="mdi:lock-outline" class="w-6 h-6" />
      <span>Continue with SSO</span>
    </button>

    <div class="divider my-5 opacity-60" />

    <div class="flex justify-center">
      <button class="link-hover text-base  opacity-70 hover:opacity-100" on:click={goToSignup}>
        don't have an account?
      </button>
    </div>
  </div>

  <div class="text-center md:text-start">
    <h1 class="lg:text-4xl 2xl:text-5xl mb-4">Welcome back!</h1>
    <p class="lg:text-lg opacity-50 tracking-tighter">Sign in to your account to continue</p>
  </div>
</section>
