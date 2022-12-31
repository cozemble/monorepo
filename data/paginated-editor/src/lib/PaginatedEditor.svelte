<script lang="ts">
    import type {DataRecord, Model} from "@cozemble/model-core";
    import {dataRecords} from "@cozemble/model-core";
    import PropertyView from "$lib/PropertyView.svelte";
    import type {CellFocus} from "$lib/CellFocus";
    import {cellFocus} from "$lib/CellFocus";
    import {afterUpdate} from "svelte";
    import PropertyEdit from "$lib/PropertyEdit.svelte";

    export let model: Model
    export let records: DataRecord[]

    let mode: "navigate" | "edit" = "navigate"
    let focus: CellFocus | null = null

    function deleteRecord(_record: DataRecord) {

    }

    function editRecord(_record: DataRecord) {

    }

    function addRecord() {
        records = [...records, dataRecords.newInstance(model, "test-user")]
    }

    function setCellFocus(row: number, column: number) {
        focus = cellFocus(row, column)
        console.log({focus})
    }

    function isFocussed(focus:CellFocus|null,row: number, column: number) {
        console.log({focus, row, column})
        return focus && focus.row === row && focus.column === column
    }

    function bodyClicked(event: Event) {
        const target = event.target as HTMLElement
        const cell = target.closest('td')
        console.log("body clicked", {event, cell})
        if(cell) {
            const rowIndex = cell.getAttribute('data-row-index')
            const colIndex = cell.getAttribute('data-column-index')
            if(rowIndex && colIndex) {
                console.log("body clicked", {rowIndex, colIndex})
                setCellFocus(parseInt(rowIndex), parseInt(colIndex))
            }
        }
    }

    function keyup(event: KeyboardEvent) {
        if(event.key === "Enter") {
            mode = "edit"
        }
        if(event.key === "Escape") {
            mode = "navigate"
        }
        console.log("keydown", {mode})
    }

    afterUpdate(() => console.log("updated", {mode, focus}))
</script>

<svelte:window on:keyup={keyup} />

<table>
    <thead>
    <tr>
        {#each model.properties as property}
            <th class="data-cell">{property.name}</th>
        {/each}
        <th>Actions</th>
    </tr>
    </thead>
    <tbody on:click={bodyClicked}>
    {#each records as record, rowIndex}
        <tr>
            {#each model.properties as property, colIndex}
                <td class:highlighted={isFocussed(focus,rowIndex, colIndex)} data-row-index={rowIndex}
                    data-column-index={colIndex}>
                    {#if mode === "edit" && isFocussed(focus,rowIndex, colIndex)}
                        <PropertyEdit record={record} property={property}/>
                    {:else}
                        <PropertyView record={record} property={property}/>
                    {/if}
                </td>
            {/each}
            <td>
                <button on:click={() => editRecord(record)}>Edit</button>
                <button on:click={() => deleteRecord(record)}>Delete</button>
            </td>
        </tr>
    {/each}
    </tbody>
</table>
<div class="actions">
    <button on:click={addRecord}>Add record</button>
</div>

<style>
    .highlighted {
        border-color: blue;
        border-width: 2px;
    }

    .data-cell {
        height: 100%;
    }

    .actions {
        margin-top: 20px;
    }

    table {
        border-collapse: collapse;
    }

    th, td {
        border: 1px solid black;
        padding: 0.5rem;
    }
</style>