<script lang="ts">
    import type {DataRecord, DataRecordPath, DataRecordPathElement, Model, Property} from "@cozemble/model-core";
    import {dottedPathFns} from "@cozemble/model-core";
    import PropertyEdit from "$lib/PropertyEdit.svelte";
    import {dataRecordPathFns, modelFns} from "@cozemble/model-api";
    import MaybeError from "$lib/MaybeError.svelte";
    import PropertyView from "$lib/PropertyView.svelte";

    export let models: Model[]
    export let model: Model
    export let record: DataRecord
    export let parentPath: DataRecordPathElement[]
    export let errors: Map<DataRecordPath, string[]>
    export let focus: DataRecordPath | null

    function isFocussed(focus: DataRecordPath | null, property: Property) {
        if (focus === null) {
            return false
        }
        const propertyPath = dataRecordPathFns.toDottedPath(dataRecordPathFns.newInstance(property, ...parentPath))
        const focusPath = dataRecordPathFns.toDottedPath(focus)
        return dottedPathFns.equals(propertyPath, focusPath)
    }

    function dataRecordPathAsString(property: Property) {
        return dataRecordPathFns.toDottedPath(dataRecordPathFns.newInstance(property, ...parentPath), 'name').value
    }
</script>

<table>
    <thead>
    <tr>
        {#each model.properties as property}
            <th>{property.name.value}</th>
        {/each}
    </tr>
    </thead>
    <tbody>
    <tr>
        {#each model.properties as property}
            {@const focussed = isFocussed(focus, property)}
            <td class:focussed data-record-path={dataRecordPathAsString(property)}>
                {#if focussed}
                    <PropertyEdit {parentPath} {property} {record}/>
                {:else}
                    <PropertyView {property} {record}/>
                {/if}
                <MaybeError {parentPath} {property} {errors}/>
            </td>
        {/each}
    </tbody>
</table>

{#each model.relationships as relationship}
    {@const relatedModel = modelFns.findById(models, relationship.modelId)}
    <h3>{relationship.name.value}</h3>
    {#if relationship._type === "has.one.relationship"}
        <svelte:self {models} model={relatedModel} record={record.values[relationship.id.value]} {errors} {focus}
                     parentPath={[...parentPath, relationship]}/>
    {:else}
        to do : cardinality many
    {/if}
{/each}

<style>
    .focussed {
        border: solid 2px blue;
    }

    table {
        border-collapse: collapse;
    }

    th,
    td {
        border: 1px solid black;
        padding: 0.5rem;
    }
</style>
