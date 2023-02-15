<script lang="ts">
import CellInputWrapper from './CellInputWrapper.svelte'

import { currentRecord } from '$lib/stores/records'

export let value: string
export let error: string | undefined = undefined
export let formula: ((props: any) => string) | Promise<string> | undefined

let loading = false

// if a formula is defined, the input is readonly and the value is calculated
$: readonly = typeof formula !== 'undefined'
$: if (typeof formula === 'function') {
  // check if formula is an async function
  if (formula.constructor.name === 'AsyncFunction') {
    // if so, wait for the result
    loading = true

    formula($currentRecord).then((result) => {
      value = result
      loading = false
    })

    loading = false
  } else {
    // otherwise, just use the result
    value = formula($currentRecord)
  }
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
