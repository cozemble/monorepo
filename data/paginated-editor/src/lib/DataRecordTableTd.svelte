<script lang="ts">
import type { DataRecordPathFocus } from '$lib/DataRecordPathFocus'
import type {
  DataRecord,
  DataRecordPath,
  DataRecordPathElement,
  Property,
} from '@cozemble/model-core'
import type { Writable } from 'svelte/store'
import PropertyEdit from '$lib/PropertyEdit.svelte'
import PropertyView from '$lib/PropertyView.svelte'
import MaybeError from '$lib/MaybeError.svelte'
import { dataRecordPathFns } from '@cozemble/model-api'

export let property: Property
export let record: DataRecord
export let parentPath: DataRecordPathElement[]
export let errors: Map<DataRecordPath, string[]>
export let showErrors: boolean
export let focus: Writable<DataRecordPathFocus>

function dataRecordPathAsString(property: Property) {
  return dataRecordPathFns.toDottedPath(
    dataRecordPathFns.newInstance(property, ...parentPath),
    'name',
  ).value
}

$: focussed = $focus.isPropertyFocussed(property, parentPath)
</script>

<td class:focussed data-record-path={dataRecordPathAsString(property)}>
  {#if focussed}
    <PropertyEdit {parentPath} {property} {record} />
  {:else}
    <PropertyView {property} {record} />
  {/if}
  <MaybeError {parentPath} {property} {errors} {showErrors} />
</td>
