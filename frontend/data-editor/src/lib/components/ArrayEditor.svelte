<script lang="ts">
import StringInput from './inputs/StringInput.svelte'
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

<div class="flex flex-col p-4 gap-4 bg-zinc-300 rounded-lg">
  <h3 class="text-lg capitalize font-semibold text-secondary">{label}</h3>

  {#each values as val, i (i)}
    <div class="flex flex-row gap-2">
      {#if items.type === 'object'}
        <ObjectEditor properties={val.properties} title={`${i}`} />
      {:else if items.type === 'array'}
        <svelte:self label={`${i}`} items={val.items} />
      {:else if items.type === 'string'}
        <StringInput name={`${i}`} value={val.value} />
      {/if}
    </div>
  {/each}

  <button class="btn btn-primary btn-sm" on:click={addValue}>Add</button>
</div>
