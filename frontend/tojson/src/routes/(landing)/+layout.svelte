<script lang="ts">
  import Header from './Header.svelte'
  import Footer from './Footer.svelte'
</script>

<div class="min-h-screen flex flex-col">
  <Header />

  <main class="sm:p-4 pb-10 flex flex-col flex-grow">
    <slot />
  </main>

  <Footer />
</div>
