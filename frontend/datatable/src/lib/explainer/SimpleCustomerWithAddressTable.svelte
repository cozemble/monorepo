<script lang="ts">
    import {dataRecordFns, modelFns, modelOptions, nestedModelFns, propertyFns} from "@cozemble/model-api";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import {eventSourcedModelFns} from "@cozemble/model-event-sourced";
    import type {DataRecord} from "@cozemble/model-core";
    import {systemConfigurationFns} from "@cozemble/model-core";
    import {backendFns} from "../appBackend";
    import {InMemoryBackend} from "../backend/InMemoryBackend";
    import {eventSourcedModelStore, setAllEventSourcedModels} from "../stores/allModels";
    import DataRecordsTableInContext from "../records/DataRecordsTableInContext.svelte";
    import {writable} from "svelte/store";
    import ModelRecordsContext from "../records/ModelRecordsContext.svelte";

    const addressModel = modelFns.newInstance("Address", modelOptions.withProperties(propertyFns.newInstance("Street"), propertyFns.newInstance("City"), propertyFns.newInstance("State"), propertyFns.newInstance("Zip")))
    const nestedAddress = nestedModelFns.newInstance("Address", addressModel.id, "one")
    const customerModel = modelFns.newInstance("Customer", modelOptions.withProperties(propertyFns.newInstance("First name"), propertyFns.newInstance("Last name")), modelOptions.withNestedModels(nestedAddress))
    addressModel.parentModelId = customerModel.id
    const models = [customerModel, addressModel]
    const eventSourcedModels = models.map(m => eventSourcedModelFns.newInstance(m))
    const systemConfiguration = systemConfigurationFns.empty()
    const addressRecord1 = dataRecordFns.random(systemConfiguration, models, addressModel, {
        Street: "11 Main Street",
        City: "Gotham City",
        State: "HPY",
        Zip: "90322"
    })
    const customerRecord1 = dataRecordFns.random(systemConfiguration, models, customerModel, {
        "First name": "John",
        "Last name": "Smith"
    })
    customerRecord1.values[nestedAddress.id.value] = [addressRecord1]
    const customerRecord2 = dataRecordFns.random(systemConfiguration, models, customerModel, {
        "First name": "Jane",
        "Last name": "Doe"
    })
                            backendFns.setBackend(new InMemoryBackend(eventSourcedModels, [customerRecord1, customerRecord2]))
    const modelStore = eventSourcedModelStore(eventSourcedModels)
    setAllEventSourcedModels(modelStore)
    const expandedRecordIds = writable([customerRecord1.id])

</script>

<h6>Customers</h6>
<ModelRecordsContext modelId={customerModel.id} permitRecordAdditions={false}>
    <DataRecordsTableInContext {expandedRecordIds}/>
</ModelRecordsContext>