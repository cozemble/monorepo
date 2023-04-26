<script lang="ts">
    import DataTable from "../lib/DataTable.svelte";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import {ConsoleLoggingBackend} from "../lib/backend/ConsoleLoggingBackend";
    import {backendFns} from "../lib/appBackend";
    import {StoreSyncBackend} from "../lib/app/StoreSyncBackend";
    import {systemConfigurationFns} from "@cozemble/model-core";
    import {registerEverything} from "@cozemble/model-assembled";

    backendFns.setBackend(new StoreSyncBackend(new ConsoleLoggingBackend()))
    const models = [] as EventSourcedModel[]
    const systemConfiguration = systemConfigurationFns.empty()
    registerEverything()
</script>

<DataTable {models} {systemConfiguration}/>