<script lang="ts">
import { initValues } from '$lib/utils'
import TableInputCells from './tableInputCells'
import ObjectEditor from './ObjectEditor.svelte'

export let label: string
export let items: Record<string, any>
export let value: any[]
export let errors: (Record<string, any> | string)[] | undefined

$: console.log(`${label} errors: `, errors)

function addValue() {
  value = [...value, initValues(items.properties)]
}
</script>

<!--
  @component 
  Creates a form for editing an array of values.
  Each value is rendered with a corresponding input field.
 -->

<div class="flex flex-col p-4 gap-4 bg-base-200 rounded-lg w-full border-2">
  <h3 class="font-bold text-xl text-primary capitalize">{label}</h3>

  <table class="table table-zebra">
    {#if !!value}
      {#each value as val, i (i)}
        <!-- Determine a structure with the type of the array -->

        <tbody>
          <tr>
            {#if items.type === 'object'}
              <td colspan="99999999" class="p-4">
                <ObjectEditor
                  properties={items.properties}
                  title={`${label} ${i + 1}`}
                  bind:value={val}
                  errors={errors ? errors[i] : undefined}
                />
              </td>
            {:else if items.type === 'array'}
              <td colspan="99999999" class="p-2">
                <svelte:self
                  label={`${label} ${i + 1}`}
                  {items}
                  bind:value={val}
                  errors={errors ? errors[i] : []}
                />
              </td>
            {:else if items.type === 'string'}
              <TableInputCells.StringInput
                bind:value={val}
                error={errors ? errors[i] : undefined}
              />
            {/if}
          </tr>
          <tr>
            <td colspan="99999999" class="p-2">
              <button
                class="btn btn-error btn-sm self-end"
                on:click={() => {
                  value = value.filter((_, index) => index !== i)
                }}
              >
                - Remove
              </button>
            </td>
          </tr>
        </tbody>
      {/each}
    {/if}
  </table>

  <button class="btn btn-primary btn-sm self-end" on:click={addValue}
    >+ Add Nested Model</button
  >
</div>
