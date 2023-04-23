<script lang="ts">
    import type {DataRecord} from "@cozemble/model-core";
    import {writable, derived} from "svelte/store";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import DataTable from "../lib/DataTable.svelte";

    let eventSourcedModels = writable([] as EventSourcedModel[])
    const models = derived(eventSourcedModels, models => models.map(m => m.model))
    let recordsByModelId: { [key: string]: DataRecord[] } = {}
</script>

<DataTable {models}  />