<script lang="ts">
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import type {ModelView} from "@cozemble/model-core";
    import {systemConfigurationFns} from "@cozemble/model-core";
    import {registerEverything} from "@cozemble/model-assembled";
    import {onMount} from 'svelte'
    import {writable} from "svelte/store";
    import {backendFns, DataTable, eventSourcedModelStore} from "../../lib";
    import {makeInMemoryBackend} from "../../lib/backend/InMemoryBackend";

    const modelViews = writable([] as ModelView[])
    const models = [] as EventSourcedModel[]
    const systemConfiguration = systemConfigurationFns.empty()
    backendFns.setBackend(makeInMemoryBackend())

    onMount(() => {
        registerEverything()
    })
</script>

<DataTable models={eventSourcedModelStore(models)}
           {modelViews}
           {systemConfiguration}
           showDevConsole={writable(true)}
           userId="test"/>