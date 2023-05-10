<script lang="ts">
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import {eventSourcedModelFns} from "@cozemble/model-event-sourced";
    import {InMemoryBackend} from "../lib/backend/InMemoryBackend";
    import {backendFns} from "../lib/appBackend";
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
    import DevOptions from "./DevOptions.svelte";

    const modelViews = writable([] as ModelView[])
    const addressModel = modelFns.newInstance("Address", modelOptions.withProperties(propertyFns.newInstance("Street"), propertyFns.newInstance("City"), propertyFns.newInstance("Postal code/Zip code", propertyOptions.required)))
    const nestedDeliveryAddress = nestedModelFns.newInstance("Delivery Address", addressModel.id, "one")

    // let customer = modelFns.newInstance("Customer", modelOptions.withProperties(propertyFns.newInstance("First name", propertyOptions.required), propertyFns.newInstance("Last name")))
    let customer = modelFns.newInstance("Customer", modelOptions.withProperties(propertyFns.newInstance("First name", propertyOptions.required), propertyFns.newInstance("Last name")))
    addressModel.parentModelId = addressModel.id
    const models = [eventSourcedModelFns.newInstance(customer), eventSourcedModelFns.newInstance(addressModel)] as EventSourcedModel[]
    const systemConfiguration = systemConfigurationFns.empty()
    const customerRecord1 = dataRecordFns.newInstance(customer, "test")
    const customerRecord2 = dataRecordFns.newInstance(customer, "test")
    const modelMap = new Map<string, EventSourcedModel>()
    modelMap.set(customer.id.value, eventSourcedModelFns.newInstance(customer))
    modelMap.set(addressModel.id.value, eventSourcedModelFns.newInstance(addressModel))
    const recordsMap = new Map<string, DataRecord[]>()
    // recordsMap.set(customer.id.value, [customerRecord1, customerRecord2])
    backendFns.setBackend(new InMemoryBackend(modelMap, recordsMap))
    // backendFns.setBackend(new InMemoryBackend())
    const permitModelling = writable(true)
    const showDevConsole = writable(false)

    onMount(() => {
        registerEverything()
    })

</script>
<DevOptions {permitModelling} {showDevConsole}/>

<DataTable models={eventSourcedModelStore(models)}
           {modelViews}
           {systemConfiguration}
           userId="test"
           navbarState={writable(customer.id.value)}
           {showDevConsole}
           {permitModelling}/>
<!--<DataTable models={eventSourcedModelStore([])} {modelViews} {systemConfiguration} userId="test"/>-->