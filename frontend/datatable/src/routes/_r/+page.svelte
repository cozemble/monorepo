<script lang="ts">
    import {onMount} from 'svelte'
    import {writable, type Writable} from 'svelte/store'

    // Cozemble
    import type {ModelView} from '@cozemble/model-core'
    import {systemConfigurationFns} from '@cozemble/model-core'
    import {eventSourcedModelFns} from '@cozemble/model-event-sourced'
    import {registerEverything} from '@cozemble/model-assembled'
    import {modelFns, modelOptions, propertyFns, propertyOptions,} from '@cozemble/model-api'

    import {makeInMemoryBackend} from '../../lib/backend/InMemoryBackend'
    import {backendFns} from '../../lib/appBackend'
    import Editor from '../../lib/components/editor/Editor.svelte'
    import {eventSourcedModelStore} from '../../lib'
    import DevOptions from '../DevOptions.svelte'

    //  dev options
    const permitModelling = writable(true)
    const showDevConsole = writable(false)

    // create a system configuration
    const systemConfiguration = systemConfigurationFns.empty()

    // models
    const modelViews: Writable<ModelView[]> = writable([])

    let customerModel = modelFns.newInstance(
        'Customer',
        modelOptions.withProperties(
            propertyFns.newInstance('First name', propertyOptions.required),
            propertyFns.newInstance('Last name'),
        ),
    )

    // nested model
    const addressModel = modelFns.newInstance(
        'Address',
        modelOptions.withProperties(
            propertyFns.newInstance('Street'),
            propertyFns.newInstance('City'),
            propertyFns.newInstance('Postal code/Zip code', propertyOptions.required),
        ),
    )

    // add the nested model to the parent model
    addressModel.parentModelId = addressModel.id

    // create event sourced models from the models
    const esModels = [
        eventSourcedModelFns.newInstance(customerModel),
        eventSourcedModelFns.newInstance(addressModel),
    ]

    backendFns.setBackend(makeInMemoryBackend(esModels))

    // register everything for Cozemble packages
    onMount(() => {
        registerEverything()
    })
</script>

<DevOptions {permitModelling} {showDevConsole}/>

<Editor
        models={eventSourcedModelStore(esModels)}
        {modelViews}
        {systemConfiguration}
        userId="test"
        navbarState={writable(customerModel.id.value)}
        {showDevConsole}
        {permitModelling}
/>
