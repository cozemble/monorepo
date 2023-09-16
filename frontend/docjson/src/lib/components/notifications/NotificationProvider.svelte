<script lang="ts">
  import notifications from '$lib/stores/notifications'
  import Notification from './Notification.svelte'

  notifications.create({
    text: 'This is an early prototype',
    description: 'No functionality is implemented yet',
    type: 'neutral',
    isClosable: true,
    // duration: 2000,
    icon: 'wpf:maintenance',
  })

  $: console.log($notifications)
</script>

<div
  class="fixed right-0 bottom-0 m-4 sm:mx-10 sm:my-20 z-50
        flex flex-col items-end justify-end gap-2
        "
>
  {#each $notifications as notification (notification._id)}
    <Notification {notification} />
  {/each}
</div>
