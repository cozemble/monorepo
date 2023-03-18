<script lang="ts">
import { handleOverrides } from '$lib/helpers/settings'
import { initValues } from '$lib/utils'
import ObjectEditorWrapper from './inputWrappers/ObjectEditorWrapper.svelte'
import SimpleInputWrapper from './inputWrappers/SimpleInputWrapper.svelte'

export let label: string
export let schema: NonNullable<CozJSONSchema['items']>
export let value: ArrayValue
export let errors: ArrayError
export let path: string[]

handleOverrides(schema)

$: console.info(`${label} array schema: `, schema)

// TODO: Add support for other types than object
function addValue() {
  value = [...value, <ArrayValue>initValues(schema)]
}
</script>

<!--
  @component 
  Creates a form for editing an array of values.
  Each value is rendered with a corresponding input field.
 -->

<div
  class="flex flex-col p-4 gap-4 bg-base-200 rounded-lg w-full border-2 {errors?.self &&
    'border-red-400'}"
>
  <div class="flex gap-8 justify-between">
    <h3 class="font-bold text-xl text-primary capitalize">{label}</h3>
    {#if !!errors?.self}
      <div class="alert alert-error shadow-lg items-start basis-0">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current flex-shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            /></svg
          >
          <span>{errors.self}</span>
        </div>
      </div>
    {/if}
  </div>

  <table class="table table-zebra">
    {#if !!value}
      {#each value as val, i (i)}
        <!-- Determine a structure with the type of the array -->

        <tbody>
          <tr>
            {#if schema.type === 'object'}
              <td colspan="99999999" class="p-4">
                <ObjectEditorWrapper
                  {schema}
                  title={`${label} ${i + 1}`}
                  bind:value={val}
                  errors={errors?.items ? errors.items[i] : undefined}
                  path={[...path, `${i}`]}
                />
              </td>
            {:else if schema.type === 'array'}
              <td colspan="99999999" class="p-2">
                <svelte:self
                  label={`${label} ${i + 1}`}
                  {schema}
                  bind:value={val}
                  errors={errors?.items ? errors.items[i] : []}
                  path={[...path, `${i}`]}
                />
              </td>
            {:else if schema.type === 'string'}
              <SimpleInputWrapper
                bind:value={val}
                error={errors?.items ? errors.items[i] : undefined}
                propertySchema={schema}
                path={[...path, `${i}`]}
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
                - Remove {schema.title || 'Item'}
              </button>
            </td>
          </tr>
        </tbody>
      {/each}
    {/if}
  </table>

  <button class="btn btn-primary btn-sm self-end" on:click={addValue}
    >+ Add {schema.title || 'Item'}</button
  >
</div>
