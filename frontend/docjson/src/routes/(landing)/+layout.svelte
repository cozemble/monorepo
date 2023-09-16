<script lang="ts">
  import Header from './Header.svelte'
  import Footer from './Footer.svelte'

  import NotificationProvider from '../../lib/components/notifications/NotificationProvider.svelte'
</script>

<Header />
<main class="sm:p-4 pb-10 flex flex-col flex-grow">
  <slot />
</main>
<Footer />

<NotificationProvider />
