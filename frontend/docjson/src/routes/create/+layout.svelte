<script lang="ts">
  import Logo from '$lib/components/Logo.svelte'
  import NotificationProvider from '$lib/components/notifications/NotificationProvider.svelte'
</script>

<header class="navbar p-4">
  <Logo />
</header>

<main class="p-4 pb-20 sm:pb-4 flex-grow flex flex-col justify-between items-center">
  <slot />
</main>

<NotificationProvider />
