<script lang="ts">
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import {eventSourcedModelFns} from "@cozemble/model-event-sourced";
    import {InMemoryBackend} from "../lib/backend/InMemoryBackend";
    import {backendFns} from "../lib/appBackend";
    import {StoreSyncBackend} from "../lib/app/StoreSyncBackend";
    import type {DataRecord, ModelView} from "@cozemble/model-core";
    import {systemConfigurationFns} from "@cozemble/model-core";
    import {registerEverything} from "@cozemble/model-assembled";
    import {onMount} from 'svelte'
    import {
        dataRecordFns,
        modelFns,
        modelOptions,
        nestedModelFns,
        propertyFns,
        propertyOptions
    } from "@cozemble/model-api";
    import DataTable from "../lib/DataTable.svelte";
    import {writable} from "svelte/store";
    import {eventSourcedModelStore} from "../lib";

    const modelViews = writable([] as ModelView[])
    const addressModel = modelFns.newInstance("Address", modelOptions.withProperties(propertyFns.newInstance("Street"), propertyFns.newInstance("City"), propertyFns.newInstance("Postal code/Zip code", propertyOptions.required)))
    const nestedDeliveryAddress = nestedModelFns.newInstance("Delivery Address", addressModel.id, "one")

    let customer = modelFns.newInstance("Customer", modelOptions.withProperties(propertyFns.newInstance("First name", propertyOptions.required), propertyFns.newInstance("Last name")), modelOptions.withNestedModels(nestedDeliveryAddress))
    addressModel.parentModelId = addressModel.id
    const models = [eventSourcedModelFns.newInstance(customer), eventSourcedModelFns.newInstance(addressModel)] as EventSourcedModel[]
    const systemConfiguration = systemConfigurationFns.empty()
    const customerRecord1 = dataRecordFns.newInstance(customer, "test")
    const customerRecord2 = dataRecordFns.newInstance(customer, "test")
    const modelMap = new Map<string, EventSourcedModel>()
    modelMap.set(customer.id.value, eventSourcedModelFns.newInstance(customer))
    modelMap.set(addressModel.id.value, eventSourcedModelFns.newInstance(addressModel))
    const recordsMap = new Map<string, DataRecord[]>()
    recordsMap.set(customer.id.value, [customerRecord1, customerRecord2])
    // backendFns.setBackend(new InMemoryBackend(modelMap, recordsMap))
    backendFns.setBackend(new InMemoryBackend())

    onMount(() => {
        registerEverything()
    })

</script>

<!--<DataTable models={eventSourcedModelStore(models)} {modelViews} {systemConfiguration} userId="test" navbarState={writable(customer.id.value)}/>-->
<DataTable models={eventSourcedModelStore([])} {modelViews} {systemConfiguration} userId="test"/>