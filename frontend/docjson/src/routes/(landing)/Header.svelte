<script lang="ts">
  import Logo from '$lib/components/Logo.svelte'
  import user from '$lib/stores/user'

  let scrollY = 0
  $: scrolled = scrollY > 50
</script>

<svelte:window bind:scrollY />

<header
  class="sticky top-0 left-0 right-0 bg-base-100/60 backdrop-blur-xl z-50 
  {scrolled ? 'shadow-2xl glass' : ''}"
>
  <div class="navbar px-4 sm:px-6">
    <div class="flex-1">
      <Logo />
    </div>

    <div class="flex-none gap-8 text-neutral">
      <a class="link-hover normal-case hidden sm:block" href="/coming-soon"> Docs </a>
      <a class="link-hover normal-case hidden sm:block" href="/pricing"> Pricing </a>

      {#if $user.isGuest}
        <a href="/coming-soon" class="btn btn-primary btn-sm normal-case"> Sign Up </a>
      {:else}
        <a href="/coming-soon" class="btn btn-primary btn-sm normal-case"> Dashboard </a>
      {/if}
    </div>
  </div>
</header>
