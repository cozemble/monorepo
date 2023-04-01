<script lang="ts">
    import type {DataRecordPathFocus} from './DataRecordPathFocus'
    import type {DataRecord, DataRecordPropertyPath, DataRecordPathParentElement, Property,} from '@cozemble/model-core'
    import type {Writable} from 'svelte/store'
    import SlotEdit from './SlotEdit.svelte'
    import SlotView from './SlotView.svelte'
    import MaybeError from './MaybeError.svelte'
    import {dataRecordPathFns} from '@cozemble/model-api'

    export let property: Property
    export let record: DataRecord
    export let parentPath: DataRecordPathParentElement[]
    export let errors: Map<DataRecordPropertyPath, string[]>
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
        <SlotEdit {parentPath} {property} {record}/>
    {:else}
        <SlotView {property} {record}/>
    {/if}
    <MaybeError {parentPath} {property} {errors} {showErrors}/>
</td>
