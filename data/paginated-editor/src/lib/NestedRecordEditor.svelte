<script lang="ts">
    import type {RecordEditContext} from "./RecordEditContext";
    import type {DataRecordPathParentElement, NestedModel} from "@cozemble/model-core";
    import DataRecordTable from "./DataRecordTable.svelte";
    import {dataRecordPathElementFns, modelFns} from "@cozemble/model-api";
    import {dataRecordFns} from "@cozemble/model-api/dist/esm";
    import NestedRecordArrayEditor from "./NestedRecordArrayEditor.svelte";

    export let rootRecordEditContext: RecordEditContext
    export let nestedModel: NestedModel
    export let parentPath: DataRecordPathParentElement[]
    export let pushContext: (context: RecordEditContext) => void
    export let popContext: () => void
    const errors = rootRecordEditContext.errors
    const showErrors = rootRecordEditContext.showErrors
    const focus = rootRecordEditContext.focus
    const rootRecord = rootRecordEditContext.record
    const modelOfNestedRecord = modelFns.findById(rootRecordEditContext.models, nestedModel.modelId)

    $: nestedRecord = dataRecordPathElementFns.getNestedRecord(rootRecordEditContext.models, $rootRecord, parentPath) ?? dataRecordFns.newInstance(modelOfNestedRecord, $rootRecord.createdBy.value)
</script>

<DataRecordTable systemConfiguration={rootRecordEditContext.systemConfiguration} record={nestedRecord}
                 model={modelOfNestedRecord} {focus} {parentPath} errors={$errors} showErrors={$showErrors}/>

{#each modelOfNestedRecord.nestedModels as nestedModel}
    <h3>{nestedModel.name.value}</h3>
    {#if nestedModel.cardinality === 'one'}
        <svelte:self {rootRecordEditContext}
                     {nestedModel}
                     parentPath={[...parentPath, nestedModel]}
                     {pushContext}
                     {popContext}/>
    {:else}
        <NestedRecordArrayEditor
                recordEditContext={rootRecordEditContext}
                {nestedModel}
                parentPath={[...parentPath, nestedModel]}
                {pushContext}
                {popContext}/>
    {/if}
{/each}
