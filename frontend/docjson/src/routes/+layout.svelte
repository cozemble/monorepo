<script lang="ts">
  import Header from './Header.svelte'
  import Footer from './Footer.svelte'
</script>

<Header />
<main class="p-4 flex flex-col flex-grow">
  <slot />
</main>
<Footer />
