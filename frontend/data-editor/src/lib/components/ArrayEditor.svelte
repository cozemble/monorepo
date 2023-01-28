<script lang="ts">
import StringInput from './inputs/StringInput.svelte'

export let items: Record<string, any> | undefined
</script>

<!--
  @component 
  Creates a form for editing an array. Each property is rendered with a corresponding input field.
  The input field is determined by the type of the property. 
  If the property is an object, it is rendered as a nested object editor. 
 -->

<button class="btn btn-primary">Add</button>

{#if items}
  <div class="flex flex-row">
    {#each Object.keys(items) as key}
      {#if items[key].type === 'object'}
        <div
          class="rounded-lg bg-slate-500 bg-opacity-20 flex flex-col p-4 m-4 gap-4 "
        >
          <h3 class="text-500 text-lg text-red-800 capitalize">{key}</h3>
          <svelte:self properties={items[key].properties} />
        </div>
      {:else if items[key].type === 'array'}
        <svelte:self items={items[key].items} />
      {:else}
        <StringInput name={key} value={items[key].value} />
      {/if}
    {/each}
  </div>
{/if}
