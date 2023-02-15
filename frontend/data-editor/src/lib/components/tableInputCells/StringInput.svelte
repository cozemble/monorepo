<script lang="ts">
import CellInputWrapper from './CellInputWrapper.svelte'

import { currentRecord } from '$lib/stores/records'

export let value: string
export let error: string | undefined = undefined
export let formula: ((props: any) => string) | undefined

// if a formula is defined, the input is readonly and the value is calculated
$: readonly = typeof formula !== 'undefined'
$: if (formula) {
  value = formula($currentRecord)
}
</script>

<CellInputWrapper {error}>
  <input
    type="text"
    bind:value
    class="input input-ghost w-full {error && 'input-error'} w-full pr-0"
    size={value.length || 2}
    {readonly}
  />
</CellInputWrapper>
