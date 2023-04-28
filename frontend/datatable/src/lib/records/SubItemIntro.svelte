<script lang="ts">
    import {dataRecordFns, modelFns, modelOptions, nestedModelFns, propertyFns} from "@cozemble/model-api";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import {eventSourcedModelFns} from "@cozemble/model-event-sourced";
    import DataRecordsTable from "./DataRecordsTable.svelte";
    import {systemConfiguration} from "../stores/systemConfiguration";
    import {RootRecordsContext} from "./RecordsContext";
    import {InMemoryBackend} from "../backend/InMemoryBackend";
    import {writable} from "svelte/store";
    import type {DataRecord} from "@cozemble/model-core";
    import {onMount} from "svelte";
    import {dataRecordsTableOptions} from "./DataRecordsTableOptions";

    const homeAddress = modelFns.newInstance("Home Address", modelOptions.withProperties(propertyFns.newInstance("Street"), propertyFns.newInstance("City"), propertyFns.newInstance("Postal code/Zip code")))
    const nestedHomeAddress = nestedModelFns.newInstance("Home Address", homeAddress.id, "one")
    const customer = modelFns.newInstance("Customer", modelOptions.withProperties(propertyFns.newInstance("First name"), propertyFns.newInstance("Last name"), propertyFns.newInstance("Email")), modelOptions.withNestedModels(nestedHomeAddress))
    const models = [customer, homeAddress]
    const eventSourcedModels = models.map(m => eventSourcedModelFns.newInstance(m))
    const homeAddressRecord = dataRecordFns.random($systemConfiguration, models, homeAddress, {
        "Street": "123 Main St",
        "City": "Anytown",
        "Postal code/Zip code": "12345"
    })
    const customerRecord = dataRecordFns.random($systemConfiguration, models, customer, {
        "First name": "Jane",
        "Last name": "Doe",
        "Email": "jane@email.com"
    })
    customerRecord.values[nestedHomeAddress.id.value] = [homeAddressRecord]
    const modelMap = new Map<string, EventSourcedModel>()
    eventSourcedModels.forEach(m => modelMap.set(m.model.id.value, m))
    const recordMap = new Map<string, DataRecord[]>()
    recordMap.set(customer.id.value, [customerRecord])
    const backend = new InMemoryBackend(modelMap, recordMap)
    const customerRecordsContext = new RootRecordsContext(backend, customer.id, writable(eventSourcedModels), [])

    onMount(async () => {
        await customerRecordsContext.loadRecords()
    })
</script>
<div>Use sub-items to divide your data into logical sections. For example, a <strong>Customer</strong> might have a
    <strong>Home Address</strong></div>

<div class="tooltip tooltip-open tooltip-accent tooltip-right" data-tip="Preview of a Customer with a sub-item">

    <div class="mt-3 disabled-content border border-info rounded p-2 ">
        <DataRecordsTable context={customerRecordsContext} expandedRecordId={customerRecord.id.value}
                          oneOnly={true}
                          options={dataRecordsTableOptions(false, false, false)}/>
    </div>
</div>
<style>
    .disabled-content {
        pointer-events: none;
        opacity: 0.5;
        border-width: 4px;
    }
</style>