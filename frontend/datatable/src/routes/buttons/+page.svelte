<script lang="ts">
    import {onMount} from 'svelte'
    import {writable, type Writable} from 'svelte/store'

    import type {ModelView} from '@cozemble/model-core'
    import {systemConfigurationFns} from '@cozemble/model-core'
    import {eventSourcedModelFns} from '@cozemble/model-event-sourced'
    import {dataRecordFns, modelFns, modelOptions, propertyFns,} from '@cozemble/model-api'

    import {emailPropertyType} from "@cozemble/model-properties-core";
    import {registerEverything} from "@cozemble/model-assembled";
    import type {Model} from "@cozemble/model-core";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import DataTable from "$lib/DataTable.svelte";
    import {backendFns, eventSourcedModelStore, makeInMemoryBackend} from "$lib";
    import DevOptions from "../DevOptions.svelte";
    import {editorExtensions} from "$lib/extensions/editorExtensions.js";
    import ExtraRecordButtons from "./ExtraRecordButtons.svelte";

    //  dev options
    const permitModelling = writable(true)
    const showDevConsole = writable(false)

    // create a system configuration
    const systemConfiguration = systemConfigurationFns.empty()

    let models:Model[] = []
    const modelViews: Writable<ModelView[]> = writable([])

    // create event sourced models from the models
    let eventSourcedModels:EventSourcedModel[] = []
    const navbarState = writable('')


    let mounted = false
    // register everything for Cozemble packages
    onMount(() => {
        registerEverything()

        let customerModel = modelFns.newInstance(
            'Customer',
            modelOptions.withProperties(
                propertyFns.newArray('Emails', emailPropertyType),
                propertyFns.newInstance('Name'),
            ),
        )
        models = [customerModel]
        eventSourcedModels = models.map(model => eventSourcedModelFns.newInstance(model))

        const customerRecord1 = dataRecordFns.random(systemConfiguration, models, customerModel, {
            'First name': 'Mike',
            'Last name': 'Hogan',
        })

        const customerRecord2 = dataRecordFns.random(systemConfiguration, models, customerModel, {
            'First name': 'Cherise',
            'Last name': 'Hogan',
        })

        const records = [customerRecord1, customerRecord2]
        // const records = []
        backendFns.setBackend(
            makeInMemoryBackend(eventSourcedModels, records),
        )
        $navbarState = customerModel.id.value
        mounted = true
    })

    editorExtensions.registerRecordButtonExtensions(ExtraRecordButtons)
</script>

<DevOptions {permitModelling} {showDevConsole}/>

{#if mounted}
    <DataTable
            models={eventSourcedModelStore(eventSourcedModels)}
            {modelViews}
            {systemConfiguration}
            userId="test"
            {navbarState}
            {showDevConsole}
            {permitModelling}
    />
{/if}