<script lang="ts">
    import {eventSourcedModelFns} from "@cozemble/model-event-sourced";
    import type {ModelView} from "@cozemble/model-core";
    import {
        modelIdFns,
        modelReferenceFns,
        modelViewFns,
        summaryViewFns,
        systemConfigurationFns
    } from "@cozemble/model-core";
    import {registerEverything} from "@cozemble/model-assembled";
    import {onMount} from 'svelte'
    import {dataRecordFns, modelFns, modelOptions, propertyFns, propertyOptions} from "@cozemble/model-api";
    import {writable} from "svelte/store";
    import DataTable from "../../lib/DataTable.svelte";
    import {backendFns, eventSourcedModelStore} from "../../lib";
    import {makeInMemoryBackend} from "../../lib/backend/InMemoryBackend";
    import RecordFilteringPanel from "../../lib/filtering/RecordFilteringPanel.svelte";
    import {tempRegisterDateFilters} from "../temp";
    import DevOptions from "../DevOptions.svelte";
    import {timestampedRecordGraphEdgeFns} from "@cozemble/model-event-sourced";
    import {recordGraphEdgeFns} from "@cozemble/model-core";

    const modelViews = writable([] as ModelView[])

    let customerModel = modelFns.newInstance("Customers", modelOptions.withProperties(propertyFns.newInstance("First name", propertyOptions.required), propertyFns.newInstance("Last name")))
    const invoiceModelId = modelIdFns.newInstance('invoices')

    const invoiceToCustomerReference = modelReferenceFns.setOriginCardinality(modelReferenceFns.newInstance(invoiceModelId, [customerModel.id], "Customer"), 'one')
    const customerToInvoicesReference = modelReferenceFns.inverse(invoiceToCustomerReference, "Invoices")
    const invoiceModel = modelFns.newInstance("Invoices", modelOptions.withId(invoiceModelId), modelOptions.withProperty(propertyFns.newInstance("Invoice ID", propertyOptions.required)), modelOptions.withSlot(invoiceToCustomerReference))
    customerModel = modelFns.applyOptions(customerModel, modelOptions.withSlot(customerToInvoicesReference))
    modelViews.update(views => [...views, modelViewFns.newInstance("Summary View", customerModel.id, summaryViewFns.withHtmlTemplate('{{First name}} {{Last name}}'))])
    modelViews.update(views => [...views, modelViewFns.newInstance("Summary View", invoiceModel.id, summaryViewFns.withHtmlTemplate('{{Invoice ID}}'))])
    const models = [customerModel, invoiceModel]
    const eventSourcedModels = models.map(m => eventSourcedModelFns.newInstance(m))
    const systemConfiguration = systemConfigurationFns.empty()
    const permitModelling = writable(true)
    const showDevConsole = writable(true)

    onMount(() => {
        tempRegisterDateFilters()
        registerEverything()
        const customerRecord1 = dataRecordFns.random(systemConfiguration, models, customerModel, {
            "First name": "John",
            "Last name": "Smith"
        })
        const customerRecord2 = dataRecordFns.random(systemConfiguration, models, customerModel, {
            "First name": "Jane",
            "Last name": "Doe",
        })

        const invoiceRecord11 = dataRecordFns.random(systemConfiguration, models, invoiceModel, {
            "Invoice ID": "Invoice #11"
        })
        const invoiceRecord12 = dataRecordFns.random(systemConfiguration, models, invoiceModel, {
            "Invoice ID": "Invoice #12"
        })
        const invoiceRecord13 = dataRecordFns.random(systemConfiguration, models, invoiceModel, {
            "Invoice ID": "Invoice #13"
        })
        const customer1ToBooking1Edge = timestampedRecordGraphEdgeFns.newInstance(recordGraphEdgeFns.newInstance(customerToInvoicesReference.id, invoiceModel.id, customerModel.id, invoiceRecord11.id, customerRecord1.id))
        const customer1ToBooking2Edge = timestampedRecordGraphEdgeFns.newInstance(recordGraphEdgeFns.newInstance(customerToInvoicesReference.id, invoiceModel.id, customerModel.id, invoiceRecord12.id, customerRecord1.id))
        const customer1ToBooking3Edge = timestampedRecordGraphEdgeFns.newInstance(recordGraphEdgeFns.newInstance(customerToInvoicesReference.id, invoiceModel.id, customerModel.id, invoiceRecord13.id, customerRecord2.id))

        backendFns.setBackend(makeInMemoryBackend(models.map(m => eventSourcedModelFns.newInstance(m)), [customerRecord1, customerRecord2, invoiceRecord11, invoiceRecord12, invoiceRecord13], [customer1ToBooking1Edge, customer1ToBooking2Edge, customer1ToBooking3Edge]))
    })

</script>

<DevOptions {permitModelling} {showDevConsole}/>

<DataTable models={eventSourcedModelStore(eventSourcedModels)}
           {modelViews}
           {systemConfiguration}
           userId="test"
           {permitModelling}
           {showDevConsole}
           navbarState={writable(customerModel.id.value)} recordFilteringComponent={RecordFilteringPanel}/>