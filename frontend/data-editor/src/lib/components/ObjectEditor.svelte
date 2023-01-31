<script lang="ts">
import ArrayEditor from './ArrayEditor.svelte'
import StringInput from './inputs/StringInput.svelte'

export let title: string
export let properties: Record<string, any>

$: objectProperties = Object.entries(properties).filter(
  ([key, value]) => value.type === 'object',
)

$: arrayProperties = Object.entries(properties).filter(
  ([key, value]) => value.type === 'array',
)

$: simpleProperties = Object.entries(properties).filter(
  ([key, value]) => value.type !== 'object' && value.type !== 'array',
)
</script>

<!-- 
  @component 
  Creates a form for editing an object. Each property is rendered with a corresponding input field.
  The input field is determined by the type of the property. 
  If the property is an object, it is rendered as a nested object editor.
-->

<div class="flex flex-col gap-4">
  <h2>{title}</h2>
  <!-- Simple properties -->
  <div class="flex flex-row gap-2">
    {#each simpleProperties as [key, value] (key)}
      <StringInput name={key} value={properties[key].value} />
    {/each}
  </div>

  <!-- Object properties -->
  {#each objectProperties as [key, value] (key)}
    <div
      class="rounded-lg bg-slate-500 bg-opacity-20 flex flex-col p-4 m-4 gap-4 "
    >
      <h3 class="text-500 text-lg text-red-800 capitalize">{key}</h3>
      <svelte:self properties={properties[key].properties} />
    </div>
  {/each}

  <!-- Array properties -->
  {#each arrayProperties as [key, value] (key)}
    <ArrayEditor label={key} items={properties[key].items} />
  {/each}
</div>
