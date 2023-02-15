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
    console.log('formula is async')
    // if so, wait for the result
    loading = true

    formula($currentRecord).then((result) => {
      value = result
      loading = false
    })
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
    disabled={readonly}
  />
  {#if loading}
    <div
      class="absolute inset-0 bg-base-100 flex items-center justify-center pointer-events-none"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        />
      </svg>
    </div>
  {/if}
</CellInputWrapper>

<style lang="postcss">
</style>
