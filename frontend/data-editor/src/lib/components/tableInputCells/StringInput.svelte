<script lang="ts">
import CellInputWrapper from './CellInputWrapper.svelte'

export let value: string
export let error: string | undefined = undefined
</script>

<CellInputWrapper {error}>
  <input
    type="text"
    bind:value
    class="input input-ghost w-full {error && 'input-error'} w-full pr-0"
    size={value.length || 2}
  />
</CellInputWrapper>
