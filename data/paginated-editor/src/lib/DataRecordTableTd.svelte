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
    import type {SystemConfiguration} from "@cozemble/model-core";

    export let modelSlot: LeafModelSlot
    export let record: DataRecord
    export let parentPath: DataRecordPathParentElement[]
    export let errors: Map<DataRecordValuePath, string[]>
    export let showErrors: boolean
    export let focus: Writable<DataRecordPathFocus>
    export let systemConfiguration: SystemConfiguration

    function dataRecordPathAsString(slot: LeafModelSlot) {
        return dataRecordValuePathFns.toDottedPath(
            dataRecordValuePathFns.newInstance(slot, ...parentPath),
            'name',
        ).value
    }

    $: focussed = $focus.isPropertyFocussed(modelSlot, parentPath)
</script>

<td class:focussed data-record-path={dataRecordPathAsString(modelSlot)} class="border border-base-300">
    {#if focussed}
        <SlotEdit {systemConfiguration} {parentPath} {modelSlot} {record}/>
    {:else}
        <SlotView {systemConfiguration} {parentPath} {modelSlot} {record}/>
    {/if}
    <MaybeError {parentPath} {modelSlot} {errors} {showErrors}/>
</td>
