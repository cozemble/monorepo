<script lang="ts">
export let value: number
export let error: string | undefined = undefined
export let readonly: boolean = false
</script>

<input
  type="number"
  bind:value
  class="input input-ghost w-full {error && 'input-error'} w-full pr-0"
  size={value?.toString().length || 1}
  {readonly}
  disabled={readonly}
/>

<style lang="postcss">
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -webkit-appearance: textfield;
}
</style>
