<script lang="ts">
import ArrayEditor from './ArrayEditor.svelte'
import SimpleInputWrapper from './inputWrappers/SimpleInputWrapper.svelte'

export let title: string
export let schema: CozJSONSchema
export let value: Record<string, any>
export let errors: ObjectError | undefined

$: properties = schema.properties

$: objectProperties = Object.entries(properties || []).filter(
  ([key, prop]) => prop.type === 'object',
)

$: arrayProperties = Object.entries(properties || []).filter(
  ([key, prop]) => prop.type === 'array',
)

$: simpleProperties = Object.entries(properties || []).filter(
  ([key, prop]) => prop.type !== 'object' && prop.type !== 'array',
)
</script>

<!-- 
  @component 
  Creates a form for editing an object. Each property is rendered with a corresponding input field.
  The input field is determined by the type of the property. 
  If the property is an object, it is rendered as a nested object editor.
-->

<div class="flex flex-col gap-4 rounded-lg">
  <h2 class="font-bold text-xl text-primary capitalize">{title}</h2>
  <table class="table w-full">
    <!-- Table header for simple properties -->
    <thead>
      <tr>
        {#each simpleProperties as [key, prop] (key)}
          <th class="text-left">{key}{prop?.formula ? ' (formula)' : ''}</th>
        {/each}
      </tr>
    </thead>

    <!-- Simple properties -->
    <tbody>
      <tr>
        {#each simpleProperties as [key, prop] (key)}
          <SimpleInputWrapper
            bind:value={value[key]}
            error={errors ? errors[key] : undefined}
            propertySchema={prop}
          />
        {/each}
      </tr>
    </tbody>

    <!-- Object properties -->
    {#each objectProperties as [key, prop] (key)}
      <tbody>
        <tr>
          <td colspan="99999999" class="p-0">
            <svelte:self
              schema={prop}
              title={key}
              bind:value={value[key]}
              errors={errors ? errors[key] : {}}
            />
          </td>
        </tr>
      </tbody>
    {/each}

    <!-- Array properties -->
    <tbody>
      {#each arrayProperties as [key, prop] (key)}
        <tr>
          <td colspan="99999999" class="p-0">
            <ArrayEditor
              label={key}
              schema={prop.items}
              bind:value={value[key]}
              errors={errors ? errors[key] : []}
            />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
