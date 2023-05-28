<script lang="ts">
    import {dataRecordFns, modelFns, modelOptions, nestedModelFns, propertyFns} from "@cozemble/model-api";
    import {systemConfiguration} from "../stores/systemConfiguration";
    import {InMemoryBackend} from "../backend/InMemoryBackend";
    import {RootRecordsContext} from "./RecordsContext";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import type {DataRecord} from "@cozemble/model-core";
    import {writable} from "svelte/store";
    import {onMount} from "svelte";
    import {eventSourcedModelFns} from "@cozemble/model-event-sourced";
    import {dataRecordsTableOptions} from "./DataRecordsTableOptions";
    import DataRecordsTable from "./DataRecordsTable.svelte";
    import {defaultOnError} from "../appBackend";

    const lineItemModel = modelFns.newInstance("Line Item", modelOptions.withProperties(propertyFns.newInstance("Item"), propertyFns.newInstance("Quantity"), propertyFns.newInstance("Unit Price")))
    const nestedLineItems = nestedModelFns.newInstance("Line Items", lineItemModel.id, "many")
    const invoiceModel = modelFns.newInstance("Invoice", modelOptions.withProperties(propertyFns.newInstance("Invoice ID"), propertyFns.newInstance("Invoice Date"), propertyFns.newInstance("Customer"), propertyFns.newInstance("Total")), modelOptions.withNestedModels(nestedLineItems))
    const models = [invoiceModel, lineItemModel]
    const applesLineItem = dataRecordFns.random($systemConfiguration, models, lineItemModel, {
        "Item": "Apple",
        "Quantity": "3",
        "Unit Price": "0.99"
    })
    const orangesLineItem = dataRecordFns.random($systemConfiguration, models, lineItemModel, {
        "Item": "Orange",
        "Quantity": "2",
        "Unit Price": "0.75"
    })
    const invoiceRecord = dataRecordFns.random($systemConfiguration, models, invoiceModel, {
        "Invoice ID": "#4316",
        "Invoice Date": "Dec 18th 2022",
        "Customer": "Cozemble Inc.",
        "Total": "$ 4.47"
    })
    invoiceRecord.values[nestedLineItems.id.value] = [applesLineItem, orangesLineItem]

    const eventSourcedModels = models.map(m => eventSourcedModelFns.newInstance(m))
    const backend = new InMemoryBackend(eventSourcedModels, [invoiceRecord])
    const customerRecordsContext = new RootRecordsContext(backend, () => $systemConfiguration,defaultOnError,invoiceModel.id, writable(eventSourcedModels))

    onMount(async () => {
        await customerRecordsContext.loadRecords()
    })
</script>

<div>An <strong>Invoice</strong> usually has many
    <strong>Line Items</strong>.  Use a <strong>sub-table</strong> to create a table inside another record.</div>

<div class="tooltip tooltip-open tooltip-accent mt-16" data-tip="Preview of a Customer with sub-sections">

    <div class="mt-3 disabled-content border border-info rounded p-2 ">
        <DataRecordsTable context={customerRecordsContext} expandedRecordIds={writable([invoiceRecord.id])}
                          oneOnly={true}
                          options={dataRecordsTableOptions(false, false, false)}/>
    </div>
</div>
<div>This is an example of a record having a <strong><em>sub-table</em></strong></div>

<style>
    .disabled-content {
        pointer-events: none;
        opacity: 0.5;
        border-width: 4px;
    }
</style>