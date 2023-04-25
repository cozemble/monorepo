<script lang="ts">
    import DataTable from "../lib/DataTable.svelte";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import {ConsoleLoggingBackend} from "../lib/backend/ConsoleLoggingBackend";
    import {backendFns} from "../lib/appBackend";
    import {StoreSyncBackend} from "../lib/app/StoreSyncBackend";

    backendFns.setBackend(new StoreSyncBackend(new ConsoleLoggingBackend()))
    const models = [] as EventSourcedModel[]
</script>

<DataTable {models}/>