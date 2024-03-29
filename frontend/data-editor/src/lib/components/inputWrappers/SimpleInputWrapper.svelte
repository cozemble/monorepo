<script lang="ts">
import { currentRecord } from '$lib/stores/records'
import StringInput from '$lib/components/inputs/simple/StringInput.svelte'
import NumberInput from '$lib/components/inputs/simple/NumberInput.svelte'
import { handleOverrides, getOverrides } from '$lib/helpers/settings'

export let value: string
export let error: string | undefined = undefined
export let propertySchema: CozJSONSchema
export let path: string[]

handleOverrides(propertySchema)

let type = propertySchema.type

const compOverrides = getOverrides()?.components

// TODO fix TypeScript error
const determineComponent = (): SimpleInputComponent => {
  // if a custom component is defined, use that anyway
  if (propertySchema?.coz?.customComponent)
    return propertySchema.coz?.customComponent

  if (type === 'string') return compOverrides?.string || StringInput

  if (type === 'number') return compOverrides?.number || NumberInput

  if (type === 'integer') return compOverrides?.integer || NumberInput

  return StringInput
}

let component: SimpleInputComponent = determineComponent()

// if a formula is defined, the input is readonly and the value is calculated
let formula = propertySchema.coz?.formula
let loading = false

$: if (!!formula) {
  loading = true

  formula.exec($currentRecord, path).then((result) => {
    value = result
    loading = false
  })
}

//
</script>

<!--
    @component
    This component is used to wrap the simple inputs in a table cell.
    
    - Displays the error message in a tooltip if there is an error.
    - Calculates the value if a formula is defined.
    - Displays a loading indicator if the value is being calculated.

    @param {string} error - The error message to display in the tooltip.
    @param {ComponentType<SvelteComponentTyped<{value: string, error?: string, readonly?: boolean}>>} component - The component to wrap.

  
  -->

<td class="p-0 min-w-max relative ">
  <div
    class="inline {error &&
      'tooltip tooltip-error tooltip-bottom tooltip-open'}"
    data-tip={error || ''}
  >
    <svelte:component
      this={component}
      bind:value
      {error}
      readonly={!!formula}
      {path}
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
  </div>
</td>
