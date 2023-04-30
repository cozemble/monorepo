<script lang="ts">
    import type {DataRecord, LeafModelSlot} from '@cozemble/model-core'
    import {SlotView} from "@cozemble/data-paginated-editor";
    import {systemConfiguration} from "../stores/systemConfiguration";
    import type {DataTableFocusControls} from "../focus/DataTableFocus";
    import {afterUpdate} from "svelte";
    import SlotEdit from "@cozemble/data-paginated-editor/src/lib/SlotEdit.svelte";
    import type {DataRecordPathParentElement} from "@cozemble/model-core";

    export let rowIndex: number
    export let colIndex: number
    export let record: DataRecord
    export let modelSlot: LeafModelSlot
    export let focusControls: DataTableFocusControls
    export let isFocused: boolean
    export let isEditing: boolean
    export let parentPath:DataRecordPathParentElement[]

    function setFocus() {
        focusControls.setFocus(rowIndex, modelSlot)
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