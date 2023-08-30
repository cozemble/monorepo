<script lang="ts">
  import { page } from '$app/stores'
  import Logo from '$lib/components/Logo.svelte'

  import Footer from './(landing)/Footer.svelte'
</script>

<header>
  <div class="navbar px-4 sm:px-6">
    <div class="flex-1">
      <Logo />
    </div>
  </div>
</header>

<main
  class={`sm:p-4 pb-10 flex flex-col flex-grow justify-center  items-center
           bg-gradient-to-tr from-primary via-secondary to-accent
          `}
>
  <section class="hero items-center justify-center text-center">
    <div class="flex flex-col justify-center items-center ">
      <h1 class="text-secondary-content opacity-50 text-9xl mb-7">{$page.status}</h1>

      <h2 class="text-secondary-content text-6xl mb-24">
        {$page?.error?.message || 'Something went wrong'}.
      </h2>

      <a href="/" class="btn glass bg-white bg-opacity-30 btn-lg text-xl">Go Home</a>
    </div>
  </section>
</main>

<Footer />
