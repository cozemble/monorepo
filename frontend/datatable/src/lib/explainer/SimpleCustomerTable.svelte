<script lang="ts">
    import {dataRecordFns, modelFns, modelOptions, propertyFns} from "@cozemble/model-api";
    import {eventSourcedModelFns} from "@cozemble/model-event-sourced";
    import {systemConfigurationFns} from "@cozemble/model-core";
    import {backendFns} from "../appBackend";
    import {makeInMemoryBackend} from "../backend/InMemoryBackend";
    import {eventSourcedModelStore, setAllEventSourcedModels} from "../stores/allModels";
    import ModelRecordsContext from "../records/ModelRecordsContext.svelte";
    import DataRecordsTableInContext from "../records/DataRecordsTableInContext.svelte";

    const customerModel = modelFns.newInstance("Customer", modelOptions.withProperties(propertyFns.newInstance("First name"), propertyFns.newInstance("Last name"), propertyFns.newInstance("Date of birth"), propertyFns.newInstance("Last visit")))
    const models = [customerModel]
    const eventSourcedModels = models.map(m => eventSourcedModelFns.newInstance(m))
    const systemConfiguration = systemConfigurationFns.empty()
    const customerRecord1 = dataRecordFns.random(systemConfiguration, models, customerModel, {
        "First name": "John",
        "Last name": "Smith",
        "Date of birth": "1980-01-01",
        "Last visit": "2020-01-01"
    })
    const customerRecord2 = dataRecordFns.random(systemConfiguration, models, customerModel, {
        "First name": "Jane",
        "Last name": "Doe",
        "Date of birth": "1993-05-15",
        "Last visit": "2023-01-22"
    })
    backendFns.setBackend(makeInMemoryBackend([eventSourcedModelFns.newInstance(customerModel)], [customerRecord1, customerRecord2]))
    const modelStore = eventSourcedModelStore(eventSourcedModels)
    setAllEventSourcedModels(modelStore)
</script>

<h6>Customers</h6>
<ModelRecordsContext modelId={customerModel.id} permitRecordAdditions={false}>
    <DataRecordsTableInContext/>
</ModelRecordsContext>