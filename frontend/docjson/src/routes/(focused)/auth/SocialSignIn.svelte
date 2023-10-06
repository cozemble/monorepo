<script lang="ts">
  import { page } from '$app/stores'
  import Icon from '@iconify/svelte'
  import type { Provider, SupabaseClient } from '@supabase/supabase-js'

  export let supabase: SupabaseClient

  const handleOAuthLogin = async (provider: Provider) => {
    let { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: $page.url.origin + '/auth/callback',
      },
    })
    if (error) console.log('OAuth Error:', error.message)
  }
</script>

<!-- TODO functionality -->

<!-- Social sign in buttons -->
<div class=" flex flex-col gap-3">
  <!-- Sign in with GitHub button -->
  <button
    class="btn bg-gray-700 hover:bg-black text-base-100 w-full"
    on:click={() => handleOAuthLogin('github')}
  >
    <!-- <Icon icon="mdi:github" class="w-6 h-6" /> -->
    <Icon icon="line-md:github-loop" class="w-6 h-6" />
    <span>Continue with GitHub</span>
  </button>

  <!-- Sign in with Linkedin button -->
  <button
    class="btn bg-[#0072b1] hover:bg-[#07537c] text-base-100 w-full"
    on:click={() => handleOAuthLogin('linkedin')}
  >
    <!-- <Icon icon="logos:linkedin-icon" class="w-6 h-6" /> -->
    <Icon icon="line-md:linkedin" class="w-6 h-6" />
    <span>Continue with Linkedin</span>
  </button>

  <!-- Sign in with Google button -->
  <button class="btn  w-full" on:click={() => handleOAuthLogin('google')}>
    <Icon icon="logos:google-icon" class="w-6 h-6" />
    <span>Continue with Google</span>
  </button>

  <!-- SSO button -->
  <button class="btn btn-link text-neutral w-full">
    <Icon icon="mdi:lock-outline" class="w-6 h-6" />
    <span>Continue with SSO</span>
  </button>
</div>
