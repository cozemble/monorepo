<script lang="ts">
import ObjectEditor from '$lib/components/ObjectEditor.svelte'

export let title: string
export let schema: CozJSONSchema
export let value: ObjectValue
export let errors: ObjectError | undefined

$: customComponent = schema.customComponent as ObjectEditorComponent
let component = ObjectEditor
</script>

<!-- 
    @component 
    Wraps an object editor in a table row. By default, it renders an ObjectEditor component.
    If the property schema has a customComponent property, it will render that component instead.
  -->

<div class="flex flex-col gap-4 rounded-lg">
  <h2 class="font-bold text-xl text-primary capitalize">{title}</h2>
  <svelte:component
    this={customComponent || component}
    bind:value
    {schema}
    {errors}
  />
</div>
