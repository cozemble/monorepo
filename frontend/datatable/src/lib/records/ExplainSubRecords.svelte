<script lang="ts">

    import {dataRecordsTableOptions} from "./DataRecordsTableOptions";
    import DataRecordsTable from "./DataRecordsTable.svelte";
    import {systemConfiguration} from "../stores/systemConfiguration";
    import {InMemoryBackend} from "../backend/InMemoryBackend";
    import {RootRecordsContext} from "./RecordsContext";
    import {dataRecordFns, modelFns, modelOptions, nestedModelFns, propertyFns} from "@cozemble/model-api";
    import {type EventSourcedModel, eventSourcedModelFns} from "@cozemble/model-event-sourced";
    import type {DataRecord} from "@cozemble/model-core";
    import {writable} from "svelte/store";
    import {onMount} from "svelte";
    import {defaultOnError} from "../appBackend";

    const addressModel = modelFns.newInstance("Address", modelOptions.withProperties(propertyFns.newInstance("Street"), propertyFns.newInstance("City"), propertyFns.newInstance("Postal code/Zip code")))
    const nestedDeliveryAddress = nestedModelFns.newInstance("Delivery Address", addressModel.id, "one")
    const nestedBillingAddress = nestedModelFns.newInstance("Billing Address", addressModel.id, "one")
    const customer = modelFns.newInstance("Customer", modelOptions.withProperties(propertyFns.newInstance("First name"), propertyFns.newInstance("Last name"), propertyFns.newInstance("Email")), modelOptions.withNestedModels(nestedBillingAddress, nestedDeliveryAddress))
    const models = [customer, addressModel]
    const eventSourcedModels = models.map(m => eventSourcedModelFns.newInstance(m))
    const deliveryAddressRecord = dataRecordFns.random($systemConfiguration, models, addressModel, {
        "Street": "123 Main St",
        "City": "Anytown",
        "Postal code/Zip code": "12345"
    })
    const billingAddressRecord = dataRecordFns.random($systemConfiguration, models, addressModel, {
        "Street": "72 Elm St",
        "City": "Electronville",
        "Postal code/Zip code": "54321"
    })
    const customerRecord = dataRecordFns.random($systemConfiguration, models, customer, {
        "First name": "Jane",
        "Last name": "Doe",
        "Email": "jane@email.com"
    })
    customerRecord.values[nestedDeliveryAddress.id.value] = [deliveryAddressRecord]
    customerRecord.values[nestedBillingAddress.id.value] = [billingAddressRecord]
    const modelMap = new Map<string, EventSourcedModel>()
    eventSourcedModels.forEach(m => modelMap.set(m.model.id.value, m))
    const recordMap = new Map<string, DataRecord[]>()
    recordMap.set(customer.id.value, [customerRecord])
    const backend = new InMemoryBackend(modelMap, recordMap)
    const customerRecordsContext = new RootRecordsContext(backend, defaultOnError,customer.id, writable(eventSourcedModels))

    onMount(async () => {
        await customerRecordsContext.loadRecords()
    })

</script>

<div>Use sub-items to divide your data into logical sections. For example, a <strong>Customer</strong> might have a
    <strong>Delivery Address</strong> and a <strong>Billing Address</strong></div>

<div class="tooltip tooltip-open tooltip-accent mt-16" data-tip="Preview of a Customer with sub-items">

    <div class="mt-3 disabled-content border border-info rounded p-2 ">
        <DataRecordsTable context={customerRecordsContext} expandedRecordId={customerRecord.id.value}
                          oneOnly={true}
                          options={dataRecordsTableOptions(false, false, false)}/>
    </div>
</div>
<div>This is an example of a record having two <strong><em>sub-records</em></strong></div>

<style>
    .disabled-content {
        pointer-events: none;
        opacity: 0.5;
        border-width: 4px;
    }
</style>