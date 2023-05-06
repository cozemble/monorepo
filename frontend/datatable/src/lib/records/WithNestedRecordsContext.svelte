<script lang="ts">
    import type {DataRecord, Model} from "@cozemble/model-core";
    import type {Readable} from "svelte/store";
    import {modelRecordsContextFns} from "./modelRecordsContextFns";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";

    export let eventSourcedModel: Readable<EventSourcedModel>
    export let model: Readable<Model>
    export let records: Readable<DataRecord[]>

    modelRecordsContextFns.setEventSourcedModel(eventSourcedModel)
    modelRecordsContextFns.setModel(model)
    modelRecordsContextFns.setRecords(records)
</script>
<slot></slot>