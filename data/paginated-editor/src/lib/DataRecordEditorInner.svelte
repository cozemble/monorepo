<script lang="ts">
    import type {DataRecord, DataRecordPath, DataRecordPathElement, Model} from "@cozemble/model-core";
    import {modelFns} from "@cozemble/model-api";
    import type {DataRecordPathFocus} from "$lib/DataRecordPathFocus";
    import type {Writable} from 'svelte/store';
    import DataRecordTable from "$lib/DataRecordTable.svelte";
    import HasManyRelationship from "./HasManyRelationship.svelte";
    import type {RecordEditContext} from "$lib/RecordEditContext";

    export let models: Model[]
    export let model: Model
    export let record: DataRecord
    export let parentPath: DataRecordPathElement[]
    export let errors: Map<DataRecordPath, string[]>
    export let showErrors: boolean
    export let focus: Writable<DataRecordPathFocus>
    export let pushContext: (context: RecordEditContext) => void
    export let popContext: () => void
</script>

<DataRecordTable {record} {model} {focus} {parentPath} {errors} {showErrors}/>

{#each model.relationships as relationship}
    {@const relatedModel = modelFns.findById(models, relationship.modelId)}
    <h3>{relationship.name.value}</h3>
    {#if relationship.subType === "has.one.relationship"}
        <svelte:self {models} model={relatedModel} record={record.values[relationship.id.value]} {errors} {showErrors} {focus}
                     parentPath={[...parentPath, relationship]}/>
    {:else}
        <HasManyRelationship {models} {relationship} {record} {errors} {showErrors} {focus} {parentPath} {pushContext} {popContext}/>
    {/if}
{/each}


