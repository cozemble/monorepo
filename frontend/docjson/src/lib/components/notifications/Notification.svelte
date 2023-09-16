<script lang="ts">
  import Icon from '@iconify/svelte'
  import type { Notification } from '$lib/stores/notifications'

  export let notification: Notification

  const { text, description, type, handleClose: onClose, isClosable } = notification

  const classes = `
    ${(type === 'error' && 'alert-error') || ''}
    ${(type === 'success' && 'alert-success') || ''}
    ${(type === 'warning' && 'alert-warning') || ''}
    ${(type === 'info' && 'alert-info') || ''}
    ${(type === 'loading' && 'alert-info') || ''}
  `.trim()

  const icon =
    notification.icon ||
    `
    ${(type === 'error' && 'mdi:alert-circle') || ''}
    ${(type === 'success' && 'mdi:check-circle') || ''}
    ${(type === 'warning' && 'mdi:alert-circle-outline') || ''}
    ${(type === 'info' && 'mdi:information-outline') || ''}
    ${(type === 'loading' && 'mdi:loading') || ''}
  `.trim()
</script>

{#if notification.show}
  <div class="alert shadow-xl relative {classes}">
    {#if type !== 'loading'}
      <Icon {icon} class="stroke-current shrink-0 w-6 h-6 xs-only:hidden" />
    {:else}
      <span class="loading" />
    {/if}

    <div class="flex flex-col">
      <span class="font-semibold">{text}</span>
      <span class="text-sm">{description}</span>
    </div>

    {#if isClosable}
      <!-- spacer div -->
      <div />
      <button class="absolute top-1 right-2 btn btn-circle btn-xs btn-neutral" on:click={onClose}
        ><Icon icon="mdi:close" class="stroke-current text-base" />
      </button>
    {/if}
  </div>
{/if}
