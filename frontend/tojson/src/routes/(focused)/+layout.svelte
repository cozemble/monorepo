<script lang="ts">
  import Logo from '$lib/components/Logo.svelte'
</script>

<!-- 
  @component
  Here in this 'focused' group we have the pages that are focused to it's content. 
  We don't have the complex header and footer here. We only display the logo and the content of the page.
 -->

<header class="navbar p-4 sm:py-3 sm:px-6">
  <Logo />
</header>

<main class="p-4 pb-20 sm:pb-4 flex-grow flex flex-col justify-between items-center">
  <slot />
</main>
