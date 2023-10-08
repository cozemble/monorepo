<script lang="ts">
  import { page } from '$app/stores'

  import OAuthProviders from './OAuthProviders.svelte'
  import { goto } from '$app/navigation'

  $: supabase = $page?.data?.supabase

  export let formTitle: string
  export let heading: string
  export let subheading: string

  export let otherPageLinkName: string
  export let otherPageLink: string

  const goToOtherPage = () => goto(otherPageLink)
</script>

<!-- @component
    This is the layout for the sign-in and sign-up pages. \
    They share the same design, so this component is used to keep consistency.
 -->

<section
  class="w-full flex-grow flex flex-col md:flex-row gap-6 md:gap-20 lg:gap-[10vw] items-center justify-start rounded-xl
 "
>
  <!-- Background decoration -->
  <div class="absolute top-1/2 left-2/3 w-32 h-32 -z-40 bg-primary/80 blur-[20em] " />
  <div class="absolute top-2/3 left-1/2 w-32 h-32 -z-40 bg-secondary/60 blur-[20em] " />
  <div class="absolute top-1/3 left-1/3 w-32 h-32 -z-40 bg-accent/80 blur-[20em] " />

  <!-- Form section -->
  <div
    class="w-[45vw] p-52 py-12 h-full 
    bg-base-100/70 backdrop-blur-3xl
    border-r border-base-300
    "
  >
    <h2 class="mb-8">
      {formTitle}
    </h2>

    <slot name="form" />
    <div class="divider my-10 text-base-content/40">or</div>

    <OAuthProviders {supabase} />
    <slot name="sso" />

    <div class="divider my-5 opacity-60" />

    <div class="flex justify-center">
      <button class="link-hover text-base  opacity-70 hover:opacity-100" on:click={goToOtherPage}>
        {otherPageLinkName}
      </button>
    </div>

    <!-- Terms of service note -->
    <div class="mt-14 text-xs text-center opacity-40">
      By continuing, you agree to our

      <!-- TODO proper links for terms and privacy pages -->
      <a href="/coming-soon" class="link"> Terms of Service</a>

      and
      <a href="/coming-soon" class="link"> Privacy Policy </a>
    </div>
  </div>

  <!-- Section on the right -->
  <div class="text-center md:text-start">
    <!-- TODO LATER MAYBE: heading typing animation -->
    <h1 class="lg:text-4xl 2xl:text-5xl mb-4">
      {heading}
    </h1>
    <p class="lg:text-lg opacity-50 tracking-tighter">
      {subheading}
    </p>
  </div>
</section>
