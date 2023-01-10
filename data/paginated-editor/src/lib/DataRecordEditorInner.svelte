<script lang="ts">
    import type {DataRecord, DataRecordPath, DataRecordPathElement, Model} from "@cozemble/model-core";
    import {modelFns} from "@cozemble/model-api";
    import type {DataRecordPathFocus} from "$lib/DataRecordPathFocus";
    import type {Writable} from 'svelte/store';
    import DataRecordTable from "$lib/DataRecordTable.svelte";
    import {afterUpdate} from 'svelte';
    import HasManyRelationship from "./HasManyRelationship.svelte";

    export let models: Model[]
    export let model: Model
    export let record: DataRecord
    export let parentPath: DataRecordPathElement[]
    export let errors: Map<DataRecordPath, string[]>
    export let focus: Writable<DataRecordPathFocus>

    afterUpdate(() => {
        if (parentPath.length === 0) {
            console.log({record, errors})
        }
    })
</script>

<DataRecordTable {record} {model} {focus} {parentPath} {errors}/>

{#each model.relationships as relationship}
    {@const relatedModel = modelFns.findById(models, relationship.modelId)}
    <h3>{relationship.name.value}</h3>
    {#if relationship.subType === "has.one.relationship"}
        <svelte:self {models} model={relatedModel} record={record.values[relationship.id.value]} {errors} {focus}
                     parentPath={[...parentPath, relationship]}/>
    {:else}
        <HasManyRelationship {models} {relationship} {record} {errors} {focus} {parentPath}/>
    {/if}
{/each}


