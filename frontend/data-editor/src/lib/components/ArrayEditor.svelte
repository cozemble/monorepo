<script lang="ts">
import TableInputCells from './tableInputCells'
import ObjectEditor from './ObjectEditor.svelte'

export let label: string
export let items: Record<string, any>

let values: (typeof items)[] = []

function addValue() {
  values = [...values, items]
}

$: console.log(values)
</script>

<!--
  @component 
  Creates a form for editing an array of values.
  Each value is rendered with a corresponding input field.
 -->

<div class="flex flex-col p-4 gap-4 bg-base-300 rounded-lg w-full">
  <h3 class="text-lg capitalize font-semibold text-secondary">{label}</h3>

  <table class="table table-zebra">
    {#each values as val, i (i)}
      <!-- Determine a structure with the type of the array -->

      <tbody>
        <tr>
          {#if items.type === 'object'}
            <td colspan="99999999">
              <ObjectEditor
                properties={val.properties}
                title={`${label} ${i + 1}`}
              />
            </td>
          {:else if items.type === 'array'}
            <td colspan="99999999">
              <svelte:self label={`${label} ${i + 1}`} items={val.items} />
            </td>
          {:else if items.type === 'string'}
            <TableInputCells.StringInput value={'test'} />
          {/if}
        </tr>
      </tbody>
    {/each}
  </table>

  <button class="btn btn-primary btn-sm" on:click={addValue}>Add</button>
</div>
