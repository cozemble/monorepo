<script lang="ts">
    import type {DataRecord} from "@cozemble/model-core";
    import type {Readable} from "svelte/store";
    import {modelRecordsContextFns} from "./modelRecordsContextFns";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import type {Model} from "@cozemble/model-core";

    export let eventSourcedModel:Readable<EventSourcedModel>
    export let model:Readable<Model>
    export let records: Readable<DataRecord[]>
    modelRecordsContextFns.setEventSourcedModel(eventSourcedModel)
    modelRecordsContextFns.setModel(model)
    modelRecordsContextFns.setRecords(records)
</script>
<slot></slot>