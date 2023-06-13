<script lang="ts">

    import type {JsonSchema} from "$lib/types/types";
    import type {Model, ModelView} from "@cozemble/model-core";
    import {systemConfigurationFns} from "@cozemble/model-core";
    import {onMount} from "svelte";
    import {modelFns} from "@cozemble/model-api";
    import {backendFns, DataTable, eventSourcedModelStore, makeInMemoryBackend} from "@cozemble/frontend-datatable";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import {eventSourcedModelFns, eventSourcedModelListFns} from "@cozemble/model-event-sourced";
    import {writable} from "svelte/store";
    import {jsonProperty, registerJsonProperties} from "$lib/properties/JsonProperty";
    import {
        registerJsonPropertyConfigurers,
        registerJsonPropertyEditors,
        registerJsonPropertyViewers
    } from "$lib/properties/registerJsonPropertyViewers";
    import {dataRecordFns} from "@cozemble/model-api";
    import type {Writable} from "svelte/store";

    let models: Model[] = []
    export const eventSourcedModels = eventSourcedModelStore([] as EventSourcedModel[])
    const systemConfiguration = systemConfigurationFns.empty()
    const writableModelViews = writable([] as ModelView[])
    const permitModelling = writable(true)
    const showDevConsole = writable(false)

    const navbarState: Writable<string | null> = writable(null)
    onMount(() => {
        registerJsonProperties()
        registerJsonPropertyViewers()
        registerJsonPropertyEditors()
        registerJsonPropertyConfigurers()
        const customerModel = modelFns.newInstance("Customer")
        customerModel.slots = [jsonProperty.string("First name"), jsonProperty.string("Last name")]
        const customer1 = dataRecordFns.random(systemConfiguration, [customerModel], customerModel)
        models = [customerModel]
        const esms = models.map(m => eventSourcedModelFns.newInstance(m))
        eventSourcedModels.set(eventSourcedModelListFns.newInstance(esms))
        backendFns.setBackend(makeInMemoryBackend(esms, [customer1]))
        navbarState.set(customerModel.id.value)
    })

</script>

{#if models.length > 0}
    <DataTable models={eventSourcedModels}
               modelViews={writableModelViews}
               {systemConfiguration}
               {permitModelling}
               {showDevConsole}
               {navbarState}
               userId="test"/>
{/if}
