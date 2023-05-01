<script lang="ts">
    import type {DataRecord, DataRecordPathParentElement, LeafModelSlot} from '@cozemble/model-core'
    import {SlotEdit, SlotView} from "@cozemble/data-paginated-editor";
    import {systemConfiguration} from "../stores/systemConfiguration";
    import type {DataTableFocusControls2} from "../focus/DataTableFocus";
    import {afterUpdate} from "svelte";

    export let rowIndex: number
    export let colIndex: number
    export let record: DataRecord
    export let modelSlot: LeafModelSlot
    export let focusControls: DataTableFocusControls2
    export let isFocused: boolean
    export let isEditing: boolean
    export let parentPath: DataRecordPathParentElement[]

    function setFocus() {
        focusControls.setFocus(rowIndex, modelSlot, parentPath)
    }

    afterUpdate(() => console.log({isFocused, isEditing, name: modelSlot.name.value}))

    function onKeydown(event: KeyboardEvent) {
        if (isFocused) {
            focusControls.keydown(event)
        }
    }
</script>

<svelte:window on:keydown={onKeydown}/>

<td data-cell-index="{rowIndex}-{colIndex}" class="border border-base-300" class:focused={isFocused}
    on:click={setFocus}>
    {#if isFocused && isEditing}
        <SlotEdit systemConfiguration={$systemConfiguration} {parentPath} {modelSlot} {record}/>
    {:else}
        <SlotView systemConfiguration={$systemConfiguration} {record} {modelSlot}/>
    {/if}
</td>

<style>
    .focused {
        border-width: 2px;
        @apply border-primary-focus;
    }
</style>