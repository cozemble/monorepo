<script lang="ts">
    import type {CreateNewRecord} from "./recordCreatorStore";
    import {createNewRecordStore} from "./recordCreatorStore";
    import {allModels} from "../../stores/allModels";
    import {dataRecordFns, modelFns} from "@cozemble/model-api";
    import {currentUserId} from "../../stores/currentUserId";
    import ModelRecordsContext from "../ModelRecordsContext.svelte";
    import {eventSourcedRecordGraphStore} from "../EventSourcedRecordGraphStore";
    import {systemConfiguration} from "../../stores/systemConfiguration";
    import {derived} from "svelte/store";
    import WithSingleRecordContext from "../../records/WithSingleRecordContext.svelte";
    import SingleRootRecordEditTable from "./SingleRootRecordEditTable.svelte";
    import {mandatory} from "@cozemble/lang-util";
    import type {RecordGraph} from "@cozemble/model-core";
    import {recordGraphFns} from "@cozemble/model-core";

    export let params: CreateNewRecord
    const model = modelFns.findById($allModels, params.modelId)
    const eventSourcedRecordGraph = eventSourcedRecordGraphStore(() => $systemConfiguration, () => $allModels, () => model, $currentUserId)
    const eventSourcedRecords = derived(eventSourcedRecordGraph, graph => graph.records)

    async function graphLoader(): Promise<RecordGraph> {
        return recordGraphFns.newInstance([dataRecordFns.newInstance(model, $currentUserId)], [])
    }

    function cancel() {
        params.onCancel()
        createNewRecordStore.update(() => null)
    }

    function save() {
        const firstRecord = mandatory($eventSourcedRecordGraph.records[0], `Expected to find a record in the event sourced records store`)
        params.onCreated(firstRecord)
        createNewRecordStore.update(() => null)
    }
</script>

<ModelRecordsContext modelId={model.id} {graphLoader} {eventSourcedRecordGraph} oneOnly={true}>
    {#each $eventSourcedRecords as eventSourcedRecord, rowIndex}
        <WithSingleRecordContext recordId={eventSourcedRecord.record.id} {rowIndex}>
            <div class="mt-2">
                <h4>Create a new {model.name.value}</h4>
                <SingleRootRecordEditTable {model} record={eventSourcedRecord.record} {save} {cancel}/>
            </div>
        </WithSingleRecordContext>
    {/each}
</ModelRecordsContext>
