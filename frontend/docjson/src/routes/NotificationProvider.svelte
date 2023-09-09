<script lang="ts">
  import Icon from '@iconify/svelte'

  const prototypeAlert = {
    text: 'This is an early prototype.',
    description: 'No functionality is implemented yet.',
    show: true,
    close: () => {
      prototypeAlert.show = false
    },
  }
</script>

{#if prototypeAlert.show}
  <div class="fixed right-0 top-0 md:top-auto md:bottom-0 m-10 my-20 z-50 ">
    <div class="alert shadow-xl">
      <Icon icon="wpf:maintenance" class="stroke-current shrink-0 w-6 h-6" />

      <div class="flex flex-col">
        <span class="font-semibold">{prototypeAlert.text}</span>
        <span class="text-sm">{prototypeAlert.description}</span>
      </div>

      <button class="btn btn-sm" on:click={prototypeAlert.close}>Okay</button>
    </div>
  </div>
{/if}
