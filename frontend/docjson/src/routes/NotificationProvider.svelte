<script lang="ts">
  import Icon from '@iconify/svelte'

  const prototypeAlert = {
    text: 'This is an early prototype',
    description: 'No functionality is implemented yet',
    show: true,
    close: () => {
      prototypeAlert.show = false
    },
  }
</script>

<div
  class="fixed right-0 bottom-0 m-4 sm:mx-10 sm:my-20 z-50 
        flex flex-col items-end justify-end gap-2
        "
>
  {#if prototypeAlert.show}
    <div class="alert shadow-xl">
      <Icon icon="wpf:maintenance" class="stroke-current shrink-0 w-6 h-6" />

      <div class="flex flex-col">
        <span class="font-semibold">{prototypeAlert.text}</span>
        <span class="text-sm">{prototypeAlert.description}</span>
      </div>

      <button
        class="absolute top-2 right-2 btn btn-circle btn-xs btn-neutral"
        on:click={prototypeAlert.close}
        ><Icon icon="mdi:close" class="stroke-current text-base" />
      </button>
    </div>
  {/if}
</div>
