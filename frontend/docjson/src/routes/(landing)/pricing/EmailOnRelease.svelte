<script lang="ts">
  import Icon from '@iconify/svelte'

  let value: string

  function submit() {
    alert('You submitted: ' + value)
  }
</script>

<div class="dropdown dropdown-center">
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label tabindex="0" class="m-1 btn btn-secondary">
    <Icon icon="mdi:bell" class="mr-2 text-xl" />
    Want to be notified?</label
  >

  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <form
    tabindex="0"
    class="dropdown-content p-4 w-[27em] max-w-[80vw] z-30 glass bg-gray-500 rounded-box flex flex-col"
  >
    <span class="mb-3 text-sm font-normal leading-4 text-base-100/70 ">
      We will notify you via email when we release the first version of the app.</span
    >

    <div class="join">
      <input
        type="email"
        class="input input-secondary join-item w-full"
        placeholder="Your email address"
        bind:value
      />
      <button class="btn join-item btn-secondary" on:click={submit}>submit</button>
    </div>
  </form>
</div>
