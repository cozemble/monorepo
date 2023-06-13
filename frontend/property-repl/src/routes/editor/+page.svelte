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

    let models: Model[] = []
    export const eventSourcedModels = eventSourcedModelStore([] as EventSourcedModel[])
    const systemConfiguration = systemConfigurationFns.empty()
    const writableModelViews = writable([] as ModelView[])
    const permitModelling = writable(true)
    const showDevConsole = writable(false)

    export const bikeCheckSchema: JsonSchema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'bike-check-schema.json',
        type: 'object',
        title: 'Bike Check',
        properties: {
            customerId: {
                $ref: 'https://cozemble.com/types/reference/data.json#/definitions/reference',
            },
            dropOffDate: {
                $ref: 'https://cozemble.com/types/date/data.json#/definitions/date',
            },
            dropOffTime: {
                $ref: 'https://cozemble.com/types/time/data.json#/definitions/time',
            },
            make: {
                type: 'string',
            },
            model: {
                type: 'string',
            },
            picture: {$ref: 'https://cozemble.com/types/attachment/data.json#/definitions/attachment'},
        },
    }

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
    })

</script>

{#if models.length > 0}
    <DataTable models={eventSourcedModels}
               modelViews={writableModelViews}
               {systemConfiguration}
               {permitModelling}
               {showDevConsole}
               userId="test"/>
{/if}
