<script lang="ts">
    import type {DataRecord, DataRecordPathParentElement, LeafModelSlot} from '@cozemble/model-core'
    import {SlotEdit, SlotView} from "@cozemble/data-paginated-editor";
    import {systemConfiguration} from "../stores/systemConfiguration";
    import type {DataTableFocusControls2} from "../focus/DataTableFocus";
    import MaybeDataTdError from "./MaybeDataTdError.svelte";
    import {singleRecordEditContext} from "./contextHelper";

    export let rootRecordIndex: number
    export let rowIndex: number
    export let colIndex: number
    export let record: DataRecord
    export let modelSlot: LeafModelSlot
    export let focusControls: DataTableFocusControls2
    export let isFocused: boolean
    export let isEditing: boolean
    export let parentPath: DataRecordPathParentElement[]

    const errors = singleRecordEditContext.getErrorsForRecord()

    function setFocus() {
        if (!isFocused) {
            focusControls.setFocus(rootRecordIndex, modelSlot, parentPath)
        }
    }

    function onKeydown(event: KeyboardEvent) {
        if (isFocused) {
            focusControls.keydown(event)
        }
    }

    async function handleDblClick() {
        setFocus()
        focusControls.beginEditing()
    }
</script>

<svelte:window on:keydown={onKeydown}/>

<td data-cell-index="{rowIndex}-{colIndex}" class="border border-base-300" class:focused={isFocused}
    on:click={setFocus} on:dblclick={handleDblClick}>
    {#if isFocused && isEditing}
        <SlotEdit systemConfiguration={$systemConfiguration} {parentPath} {modelSlot} {record}/>
    {:else}
        <SlotView systemConfiguration={$systemConfiguration} {parentPath} {record} {modelSlot}/>
    {/if}
    <MaybeDataTdError errors={$errors} {modelSlot} {parentPath}/>
</td>

<style>
    .focused {
        border-width: 2px;
        @apply border-primary-focus;
    }
</style>