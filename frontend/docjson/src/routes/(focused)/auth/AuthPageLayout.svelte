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
  class="w-full flex-grow flex 
  flex-col-reverse md:flex-row 
  gap-6 md:gap-20 lg:gap-[10vw] 
  items-start justify-start rounded-xl
  "
>
  <!-- Background decoration -->
  <div class="absolute top-1/2 left-2/3 w-32 h-32 -z-40 bg-primary/80 blur-[6rem] " />
  <div class="absolute top-2/3 left-1/2 w-32 h-32 -z-40 bg-secondary/60 blur-[6rem] " />
  <div class="absolute top-1/3 left-1/3 w-32 h-32 -z-40 bg-accent/80 blur-[6rem] " />

  <!-- Form section -->
  <div
    class="w-full md:w-[45vw] 
    p-4 md:px-[5vw] xl:py-12 xl:px-[8vw] 2xl:px-[11vw] 
    h-full 
    md:bg-base-100/70 backdrop-blur-3xl
    md:border-r md:border-base-300
    "
  >
    <h2 class="mb-4 md:mb-8 text-2xl md:text-3xl">
      {formTitle}
    </h2>

    <slot name="form" />
    <div class="divider my-5 2xl:my-10 text-base-content/40">or</div>

    <OAuthProviders {supabase} />

    <div class="divider my-2 2xl:my-5 opacity-60" />

    <!-- Link to the other page -->
    <!-- TODO make this more accessible (maybe a link at the header) -->
    <div class="flex justify-center">
      <button class="link-hover text-base opacity-70 hover:opacity-100" on:click={goToOtherPage}>
        {otherPageLinkName}
      </button>
    </div>

    <!-- Terms of service note -->
    <div class="mt-14 text-xs text-center text-base-content/50">
      By continuing, you agree to our

      <!-- TODO proper links for terms and privacy pages -->
      <a href="/coming-soon" class="link hover:text-base-content/80"> Terms of Service</a>

      and
      <a href="/coming-soon" class="link hover:text-base-content/80"> Privacy Policy </a>
    </div>
  </div>

  <!-- Section on the right -->
  <div class="text-center md:text-start md:mt-[40vh]">
    <!-- TODO LATER MAYBE: heading typing animation -->
    <h1 class="mb-2 xl:mb-4 lg:text-5xl 2xl:text-6xl ">
      {heading}
    </h1>
    <p class="2xl:text-lg opacity-50 tracking-tighter">
      {subheading}
    </p>
  </div>
</section>
