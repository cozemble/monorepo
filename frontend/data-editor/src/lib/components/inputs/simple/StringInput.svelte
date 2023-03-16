<script lang="ts">
export let value: string
export let error: string | undefined = undefined
export let readonly: boolean = false
</script>

<input
  type="text"
  bind:value
  class="input input-ghost w-full {error && 'input-error'} w-full pr-0"
  size={value?.length || 2}
  {readonly}
  disabled={readonly}
/>
