<script lang="ts">
    import {eventSourcedModelFns} from "@cozemble/model-event-sourced";
    import type {Model, ModelView} from "@cozemble/model-core";
    import {systemConfigurationFns} from "@cozemble/model-core";
    import {registerEverything} from "@cozemble/model-assembled";
    import {onMount} from 'svelte'
    import {writable} from "svelte/store";
    import DataTable from "../../lib/DataTable.svelte";
    import {backendFns, eventSourcedModelStore} from "$lib";
    import {makeInMemoryBackend} from "$lib/backend/InMemoryBackend";
    import RecordFilteringPanel from "../../lib/filtering/RecordFilteringPanel.svelte";
    import {tempRegisterDateFilters} from "../temp";
    import DevOptions from "../DevOptions.svelte";

    const modelViews = writable([] as ModelView[])

    const models = [] as Model[]
    const eventSourcedModels = models.map(m => eventSourcedModelFns.newInstance(m))
    const systemConfiguration = systemConfigurationFns.empty()
    const permitModelling = writable(true)
    const showDevConsole = writable(true)
    let modelStore = eventSourcedModelStore(eventSourcedModels)
    let pasteCount = 0

    onMount(() => {
        tempRegisterDateFilters()
        registerEverything()
        backendFns.setBackend(makeInMemoryBackend(models.map(m => eventSourcedModelFns.newInstance(m)), [], []))
    })

    function pasted(event: Event) {
        const text = (event.target as HTMLTextAreaElement).value
        try {
            const models = JSON.parse(text) as Model[]
            console.log({models})
            const eventSourcedModels = models.map(m => eventSourcedModelFns.newInstance(m))
            backendFns.setBackend(makeInMemoryBackend(models.map(m => eventSourcedModelFns.newInstance(m)), [], []))
            modelStore = eventSourcedModelStore(eventSourcedModels)
            pasteCount = pasteCount + 1
        } catch (e) {
            console.error(e, text)
        }
    }
</script>

<textarea style="width: 100%; height: 200px;" on:blur={pasted}/>

{#key pasteCount}
    <DevOptions {permitModelling} {showDevConsole}/>

    <DataTable models={modelStore}
               {modelViews}
               {systemConfiguration}
               userId="test"
               {permitModelling}
               {showDevConsole}
               recordFilteringComponent={RecordFilteringPanel}/>
{/key}