<script lang="ts">
    import {dataRecordFns, modelFns, modelOptions, nestedModelFns, propertyFns} from "@cozemble/model-api";
    import {eventSourcedModelFns} from "@cozemble/model-event-sourced";
    import {modelPluralNameFns, systemConfigurationFns} from "@cozemble/model-core";
    import {backendFns} from "../appBackend";
    import {makeInMemoryBackend} from "../backend/InMemoryBackend";
    import {eventSourcedModelStore, setAllEventSourcedModels} from "../stores/allModels";
    import DataRecordsTableInContext from "../records/DataRecordsTableInContext.svelte";
    import {writable} from "svelte/store";
    import ModelRecordsContext from "../records/ModelRecordsContext.svelte";

    let lineItemModel = modelFns.newInstance("Line Item", modelOptions.withProperties(propertyFns.newInstance("Item"), propertyFns.newInstance("Quantity"), propertyFns.newInstance("Unit Price")))
    lineItemModel.pluralName = modelPluralNameFns.newInstance("Line Items")
    const nestedLineItems = nestedModelFns.newInstance("Line Items", lineItemModel.id, "many")
    let invoiceModel = modelFns.newInstance("Invoice", modelOptions.withProperties(propertyFns.newInstance("Invoice Number"), propertyFns.newInstance("Invoice Date"), propertyFns.newInstance("Order Number")), modelOptions.withNestedModels(nestedLineItems))
    lineItemModel.parentModelId = invoiceModel.id

    const systemConfiguration = systemConfigurationFns.empty()
    const models = [invoiceModel, lineItemModel]
    const lineItem1 = dataRecordFns.random(systemConfiguration, models, lineItemModel, {
        "Item": "Banana",
        "Quantity": "2",
        "Unit Price": "0.89"
    })
    const lineItem2 = dataRecordFns.random(systemConfiguration, models, lineItemModel, {
        "Item": "Apple",
        "Quantity": "3",
        "Unit Price": "0.75"
    })

    const eventSourcedModels = models.map(m => eventSourcedModelFns.newInstance(m))
    const invoiceRecord1 = dataRecordFns.random(systemConfiguration, models, invoiceModel, {
        "Invoice Number": "#22",
        "Invoice Date": "2023/11/23",
        "Order Number": "PO866"
    })
    invoiceRecord1.values[nestedLineItems.id.value] = [lineItem1, lineItem2]
    const invoiceRecord2 = dataRecordFns.random(systemConfiguration, models, invoiceModel, {
        "Invoice Number": "#23",
        "Invoice Date": "2023/11/24",
        "Order Number": "OD3445"
    })
    backendFns.setBackend(makeInMemoryBackend([eventSourcedModelFns.newInstance(invoiceModel)], [invoiceRecord1, invoiceRecord2]))
    const modelStore = eventSourcedModelStore(eventSourcedModels)
    setAllEventSourcedModels(modelStore)
    const expandedRecordIds = writable([invoiceRecord1.id])

</script>

<h6>Invoices</h6>
<ModelRecordsContext modelId={invoiceModel.id} permitRecordAdditions={false}>
    <DataRecordsTableInContext {expandedRecordIds}/>
</ModelRecordsContext>