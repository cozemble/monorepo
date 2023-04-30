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
    import {writable} from "svelte/store";
    import {dataRecordFns} from "@cozemble/model-api";
    import type {DataRecord} from "@cozemble/model-core";

    let customer = modelFns.newInstance("Customer", modelOptions.withProperties(propertyFns.newInstance("First name"), propertyFns.newInstance("Last name")))
    const models = [eventSourcedModelFns.newInstance(customer)] as EventSourcedModel[]
    const systemConfiguration = systemConfigurationFns.empty()
    const customerRecord1 = dataRecordFns.newInstance(customer, "test")
    const customerRecord2 = dataRecordFns.newInstance(customer, "test")
    const modelMap = new Map<string, EventSourcedModel>()
    modelMap.set(customer.id.value, eventSourcedModelFns.newInstance(customer))
    const recordsMap = new Map<string, DataRecord[]>()
    recordsMap.set(customer.id.value, [customerRecord1, customerRecord2])
    backendFns.setBackend(new StoreSyncBackend(new InMemoryBackend(modelMap, recordsMap)))

    onMount(() => {
        registerEverything()
    })

</script>

<DataTable {models} {systemConfiguration} userId="test" navbarState={writable(customer.id.value)}/>