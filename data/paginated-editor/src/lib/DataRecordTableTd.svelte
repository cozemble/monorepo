<script lang="ts">
    import type {DataRecordPathFocus} from './DataRecordPathFocus'
    import type {DataRecord, DataRecordValuePath, DataRecordPathParentElement, Property,} from '@cozemble/model-core'
    import type {Writable} from 'svelte/store'
    import SlotEdit from './SlotEdit.svelte'
    import SlotView from './SlotView.svelte'
    import MaybeError from './MaybeError.svelte'
    import {dataRecordValuePathFns} from '@cozemble/model-api'

    export let property: Property
    export let record: DataRecord
    export let parentPath: DataRecordPathParentElement[]
    export let errors: Map<DataRecordValuePath, string[]>
    export let showErrors: boolean
    export let focus: Writable<DataRecordPathFocus>

    function dataRecordPathAsString(property: Property) {
        return dataRecordValuePathFns.toDottedPath(
            dataRecordValuePathFns.newInstance(property, ...parentPath),
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
