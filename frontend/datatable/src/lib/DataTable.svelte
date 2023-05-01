<script lang="ts">
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import {allEventSourcedModels} from "./stores/allModels";
    import type {SystemConfiguration} from "@cozemble/model-core";
    import {currentUserId} from "./stores/currentUserId";
    import {systemConfiguration as systemConfigurationStore} from "./stores/systemConfiguration";
    import DataTableInner from "./DataTableInner.svelte";
    import type {Writable} from "svelte/store";
    import {writable} from "svelte/store";

    export let models: EventSourcedModel[]
    export let systemConfiguration: SystemConfiguration
    export let userId: string
    export let navbarState: Writable<string | null> = writable(null)

    currentUserId.set(userId)
    allEventSourcedModels.set(models)
    systemConfigurationStore.set(systemConfiguration)
</script>

<DataTableInner {navbarState}/>
