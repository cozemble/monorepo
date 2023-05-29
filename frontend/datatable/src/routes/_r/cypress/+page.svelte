<script lang="ts">
    import type {EventSourcedModel} from '@cozemble/model-event-sourced'
    import type {DataRecord, ModelView} from '@cozemble/model-core'
    import {systemConfigurationFns} from '@cozemble/model-core'
    import {registerEverything} from '@cozemble/model-assembled'
    import {onMount} from 'svelte'
    import {writable} from 'svelte/store'
    import {backendFns, eventSourcedModelStore} from '../../../lib'
    import {testModelsLocalStorageKey} from './testModels'
    import {testRecordsLocalStorageKey} from './testModels.js'
    import {makeInMemoryBackend} from '../../../lib/backend/InMemoryBackend'
    import DevOptions from '../../DevOptions.svelte'
    import Editor from '$lib/components/editor/Editor.svelte'

    const modelViews = writable([] as ModelView[])
    let models = [] as EventSourcedModel[]
    const systemConfiguration = systemConfigurationFns.empty()
    const permitModelling = writable(true)
    const showDevConsole = writable(false)

    let mounted = false
    onMount(() => {
        registerEverything()
        const storedModelJson =
            localStorage.getItem(testModelsLocalStorageKey) ?? '[]'
        const storedRecordsJson =
            localStorage.getItem(testRecordsLocalStorageKey) ?? '[]'
        models = JSON.parse(storedModelJson)
        const records = JSON.parse(storedRecordsJson) as DataRecord[]
        backendFns.setBackend(makeInMemoryBackend(models, records))
        mounted = true
    })
</script>

{#if mounted}
    <DevOptions {permitModelling} {showDevConsole}/>
    <Editor
            models={eventSourcedModelStore(models)}
            {modelViews}
            {systemConfiguration}
            userId="test"
            {showDevConsole}
            {permitModelling}
    />
{/if}
