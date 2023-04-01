<script lang="ts">
    import type {DataRecordPathFocus} from './DataRecordPathFocus'
    import type {
        DataRecord,
        DataRecordPathParentElement,
        DataRecordValuePath,
        LeafModelSlot,
    } from '@cozemble/model-core'
    import type {Writable} from 'svelte/store'
    import SlotEdit from './SlotEdit.svelte'
    import SlotView from './SlotView.svelte'
    import MaybeError from './MaybeError.svelte'
    import {dataRecordValuePathFns} from '@cozemble/model-api'

    export let modelSlot: LeafModelSlot
    export let record: DataRecord
    export let parentPath: DataRecordPathParentElement[]
    export let errors: Map<DataRecordValuePath, string[]>
    export let showErrors: boolean
    export let focus: Writable<DataRecordPathFocus>

    function dataRecordPathAsString(slot: LeafModelSlot) {
        return dataRecordValuePathFns.toDottedPath(
            dataRecordValuePathFns.newInstance(slot, ...parentPath),
            'name',
        ).value
    }

    $: focussed = $focus.isPropertyFocussed(modelSlot, parentPath)
</script>

<td class:focussed data-record-path={dataRecordPathAsString(modelSlot)}>
    {#if focussed}
        <SlotEdit {parentPath} {modelSlot} {record}/>
    {:else}
        <SlotView {modelSlot} {record}/>
    {/if}
    <MaybeError {parentPath} {modelSlot} {errors} {showErrors}/>
</td>
