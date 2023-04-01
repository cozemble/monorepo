<script lang="ts">
import type {
  DataRecordValuePath,
  DataRecordPathParentElement,
  Property,
} from '@cozemble/model-core'
import { getMyErrors } from './getMyErrors'

export let property: Property
export let parentPath: DataRecordPathParentElement[]
export let errors: Map<DataRecordValuePath, string[]>
export let showErrors: boolean

$: myErrors = getMyErrors(errors, parentPath, property)
</script>

{#if myErrors.length > 0 && showErrors}
  <hr />
  <div class="validation-errors">
    {#each myErrors as error}
      <div>{error}</div>
    {/each}
  </div>
{/if}

<style>
.validation-errors {
  color: red;
}
</style>
