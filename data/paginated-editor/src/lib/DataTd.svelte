<script lang="ts">

    import PropertyEdit from "$lib/PropertyEdit.svelte";
    import PropertyView from "$lib/PropertyView.svelte";
    import {type CellFocus, isFocussedCell} from "$lib/CellFocus";
    import type {DataRecord, Property} from "@cozemble/model-core";
    import {propertyDescriptors} from "@cozemble/model-core";
    import type {Writable} from "svelte/store";
    import {afterUpdate} from "svelte";

    export let focus: Writable<CellFocus | null>
    export let rowIndex: number
    export let colIndex: number
    export let record: DataRecord
    export let property: Property
    export let showErrors = false

    $: propertyDescriptor = propertyDescriptors.mandatory(property)
    $: errors = propertyDescriptor.validateValue(property, propertyDescriptor.getValue(property, record))

    afterUpdate(() => console.log({showErrors, errors, record}))
</script>

<td class:highlighted={isFocussedCell($focus,rowIndex, colIndex)}
    data-cell-index="{rowIndex}-{colIndex}">
    {#if isFocussedCell($focus, rowIndex, colIndex)}
        <PropertyEdit record={record} property={property}/>
    {:else}
        <PropertyView record={record} property={property}/>
    {/if}
    {#if showErrors && errors.length > 0}
        <div class="validation-errors">
            {#each errors as error}
                <div class="error">{error}</div>
            {/each}
        </div>
    {/if}
</td>

<style>
    .validation-errors {
        border-top: solid 1px black;
    }
    .error {
        color: red;
        font-size: 0.8em;
    }

    .highlighted {
        border-color: blue;
        border-width: 2px;
    }

    td {
        border: 1px solid black;
        padding: 0.5rem;
    }
</style>