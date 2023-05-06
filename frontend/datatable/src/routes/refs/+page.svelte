<script lang="ts">
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import {eventSourcedModelFns} from "@cozemble/model-event-sourced";
    import type {DataRecord, ModelView} from "@cozemble/model-core";
    import {modelReferenceFns, modelViewFns, systemConfigurationFns} from "@cozemble/model-core";
    import {registerEverything} from "@cozemble/model-assembled";
    import {onMount} from 'svelte'
    import {dataRecordFns, modelFns, modelOptions, propertyFns, propertyOptions} from "@cozemble/model-api";
    import {writable} from "svelte/store";
    import DataTable from "../../lib/DataTable.svelte";
    import {backendFns} from "../../lib";
    import {InMemoryBackend} from "../../lib/backend/InMemoryBackend";
    import RecordFilteringPanel from "../../lib/filtering/RecordFilteringPanel.svelte";
    import {tempRegisterDateFilters} from "../temp";
    import {eventSourcedModelStore} from "../../lib";
    import {summaryViewFns} from "@cozemble/model-core";
    import DevOptions from "../DevOptions.svelte";

    const modelViews = writable([] as ModelView[])

    const customerModel = modelFns.newInstance("Customers", modelOptions.withProperties(propertyFns.newInstance("First name", propertyOptions.required), propertyFns.newInstance("Last name")))
    const invoiceModel = modelFns.newInstance("Invoices", modelOptions.withSlot(modelReferenceFns.newInstance([customerModel.id], "Customer")))
    modelViews.update(views => [...views, modelViewFns.newInstance("Summary View", customerModel.id, summaryViewFns.empty())])
    const models = [customerModel, invoiceModel]
    const eventSourcedModels = models.map(m => eventSourcedModelFns.newInstance(m))
    const systemConfiguration = systemConfigurationFns.empty()
    const customerRecord1 = dataRecordFns.newInstance(customerModel, "test")
    const customerRecord2 = dataRecordFns.newInstance(customerModel, "test")
    const invoiceRecord1 = dataRecordFns.newInstance(invoiceModel, "test")
    const modelMap = new Map<string, EventSourcedModel>()
    modelMap.set(customerModel.id.value, eventSourcedModelFns.newInstance(customerModel))
    modelMap.set(invoiceModel.id.value, eventSourcedModelFns.newInstance(invoiceModel))
    const recordsMap = new Map<string, DataRecord[]>()
    recordsMap.set(customerModel.id.value, [customerRecord1, customerRecord2])
    recordsMap.set(invoiceModel.id.value, [invoiceRecord1])
    backendFns.setBackend(new InMemoryBackend(modelMap, recordsMap))
    const permitModelling = writable(true)
    const showDevConsole = writable(true)

    onMount(() => {
        tempRegisterDateFilters()
        registerEverything()
    })

</script>

<DevOptions {permitModelling} {showDevConsole}/>

<DataTable models={eventSourcedModelStore(eventSourcedModels)}
           {modelViews}
           {systemConfiguration}
           userId="test"
           {permitModelling}
           {showDevConsole}
           navbarState={writable(invoiceModel.id.value)} recordFilteringComponent={RecordFilteringPanel}/>