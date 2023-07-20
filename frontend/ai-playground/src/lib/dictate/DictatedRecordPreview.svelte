<script lang="ts">
    import {
        eventSourcedDataRecordFns,
        type EventSourcedModel,
        type EventSourcedRecordGraph,
        eventSourcedRecordGraphFns
    } from "@cozemble/model-event-sourced";
    import type {DataRecord} from "@cozemble/model-core";
    import {allModels} from "$lib/generative/stores";
    import type {EventSourcedRecordGraphStore} from "@cozemble/frontend-datatable";
    import {DataRecordsTableInContext, ModelRecordsContext} from "@cozemble/frontend-datatable";
    import DictatedRecordsContext from "$lib/dictate/DictatedRecordsContext.svelte";
    import {writable} from "svelte/store";

    export let model: EventSourcedModel
    export let record: DataRecord
    export let eventSourcedRecordGraph: EventSourcedRecordGraphStore
    const expandedRecordIds = writable([record.id])

    async function graphLoader(): Promise<EventSourcedRecordGraph> {
        return eventSourcedRecordGraphFns.newInstance([eventSourcedDataRecordFns.fromRecord($allModels, record)], [], [])
    }
</script>

<ModelRecordsContext modelId={model.model.id} {graphLoader} {eventSourcedRecordGraph}>
    <DictatedRecordsContext {record}>
        <DataRecordsTableInContext oneOnly={true} {expandedRecordIds}/>
    </DictatedRecordsContext>
</ModelRecordsContext>
