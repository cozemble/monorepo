<script lang="ts">
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import {eventSourcedModelFns} from "@cozemble/model-event-sourced";
    import {InMemoryBackend} from "../lib/backend/InMemoryBackend";
    import {backendFns} from "../lib/appBackend";
    import type {DataRecord, ModelView} from "@cozemble/model-core";
    import {modelReferenceFns, modelReferenceIdFns, systemConfigurationFns} from "@cozemble/model-core";
    import {registerEverything} from "@cozemble/model-assembled";
    import {onMount} from 'svelte'
    import {dataRecordFns, modelFns, modelOptions, propertyFns, propertyOptions} from "@cozemble/model-api";
    import DataTable from "../lib/DataTable.svelte";
    import {writable} from "svelte/store";
    import {eventSourcedModelStore} from "../lib";
    import DevOptions from "./DevOptions.svelte";
    import {modelViewFns, summaryViewFns} from "@cozemble/model-core";

    let customer = modelFns.newInstance("Customer", modelOptions.withProperties(propertyFns.newInstance("First name", propertyOptions.required), propertyFns.newInstance("Last name")))
    let invoice = modelFns.newInstance("Invoice", modelOptions.withProperties(propertyFns.newInstance("Invoice number", propertyOptions.required)), modelOptions.withSlot(modelReferenceFns.forwardToModel(customer, modelReferenceIdFns.newInstance(), "one")))
    const modelViews = writable([modelViewFns.newInstance("Summary View", customer.id, summaryViewFns.withHtmlTemplate('{{First name}} {{Last name}}'))] as ModelView[])
    const models = [customer, invoice]
    const eventSourcedModels = models.map(m => eventSourcedModelFns.newInstance(m))
    const systemConfiguration = systemConfigurationFns.empty()
    const permitModelling = writable(true)
    const showDevConsole = writable(false)

    onMount(() => {
        registerEverything()
        const customerRecord1 = dataRecordFns.random(systemConfiguration, models, customer, {
            "First name": "Mike",
            "Last name": "Hogan"
        })
        const customerRecord2 = dataRecordFns.random(systemConfiguration, models, customer, {
            "First name": "Cherise",
            "Last name": "Hogan"
        })
        const modelMap = new Map<string, EventSourcedModel>()
        modelMap.set(customer.id.value, eventSourcedModelFns.newInstance(customer))
        const recordsMap = new Map<string, DataRecord[]>()
        recordsMap.set(customer.id.value, [customerRecord1, customerRecord2])
        backendFns.setBackend(new InMemoryBackend(modelMap, recordsMap))
    })

</script>

<DevOptions {permitModelling} {showDevConsole}/>

<DataTable models={eventSourcedModelStore(eventSourcedModels)}
           {modelViews}
           {systemConfiguration}
           userId="test"
           navbarState={writable(invoice.id.value)}
           {showDevConsole}
           {permitModelling}/>
<!--<DataTable models={eventSourcedModelStore([])} {modelViews} {systemConfiguration} userId="test"/>-->