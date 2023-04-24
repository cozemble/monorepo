<script lang="ts">
    import DataTable from "../lib/DataTable.svelte";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import {backendStore, saveModels} from "../lib/appBackend";
    import {ConsoleLoggingBackend} from "../lib/backend/ConsoleLoggingBackend";

    backendStore.set(new ConsoleLoggingBackend())
    const models = [] as EventSourcedModel[]
</script>

<DataTable {models}/>