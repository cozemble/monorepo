<script lang="ts">
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import {eventSourcedModelFns} from "@cozemble/model-event-sourced";
    import type {DataRecord, ModelView} from "@cozemble/model-core";
    import {modelReferenceFns, systemConfigurationFns} from "@cozemble/model-core";
    import {registerEverything} from "@cozemble/model-assembled";
    import {onMount} from 'svelte'
    import {dataRecordFns, modelFns, modelOptions, propertyFns, propertyOptions} from "@cozemble/model-api";
    import {writable} from "svelte/store";
    import DataTable from "../../lib/DataTable.svelte";
    import {backendFns} from "../../lib/appBackend";
    import {StoreSyncBackend} from "../../lib/app/StoreSyncBackend";
    import {InMemoryBackend} from "../../lib/backend/InMemoryBackend";
    import RecordFilteringPanel from "../../lib/filtering/RecordFilteringPanel.svelte";
    import {tempRegisterDateFilters} from "../temp";

    const modelViews: ModelView[] = []

    const customerModel = modelFns.newInstance("Customers", modelOptions.withProperties(propertyFns.newInstance("First name", propertyOptions.required), propertyFns.newInstance("Last name")))
    const invoiceModel = modelFns.newInstance("Invoices", modelOptions.withSlot(modelReferenceFns.newInstance([customerModel.id], "Customer")))
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
    backendFns.setBackend(new StoreSyncBackend(new InMemoryBackend(modelMap, recordsMap)))

    onMount(() => {
        tempRegisterDateFilters()
        registerEverything()
    })

</script>

<DataTable models={eventSourcedModels}
           {modelViews}
           {systemConfiguration}
           userId="test"
           navbarState={writable(invoiceModel.id.value)} recordFilteringComponent={RecordFilteringPanel}/>