<script lang="ts">
    import DataTable from "../lib/DataTable.svelte";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import {eventSourcedModelFns} from "@cozemble/model-event-sourced";
    import {InMemoryBackend} from "../lib/backend/InMemoryBackend";
    import {backendFns} from "../lib/appBackend";
    import {StoreSyncBackend} from "../lib/app/StoreSyncBackend";
    import {systemConfigurationFns} from "@cozemble/model-core";
    import {registerEverything} from "@cozemble/model-assembled";
    import {onMount} from 'svelte'
    import {modelFns, modelOptions, propertyFns} from "@cozemble/model-api";

    backendFns.setBackend(new StoreSyncBackend(new InMemoryBackend()))
    let customer = modelFns.newInstance("Customer", modelOptions.withProperties(propertyFns.newInstance("First name"), propertyFns.newInstance("Last name")))
    const models = [eventSourcedModelFns.newInstance(customer)] as EventSourcedModel[]
    const systemConfiguration = systemConfigurationFns.empty()

    onMount(() => {
        registerEverything()
    })

</script>

<DataTable {models} {systemConfiguration} userId="test"/>