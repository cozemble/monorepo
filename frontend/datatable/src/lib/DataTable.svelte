<script lang="ts">
    import {setAllEventSourcedModels} from "./stores/allModels";
    import type {ModelView, SystemConfiguration} from "@cozemble/model-core";
    import {currentUserId} from "./stores/currentUserId";
    import {systemConfiguration as systemConfigurationStore} from "./stores/systemConfiguration";
    import DataTableInner from "./DataTableInner.svelte";
    import type {Writable} from "svelte/store";
    import {writable} from "svelte/store";
    import {onMount} from "svelte";
    import {ModelReferenceEditor, ModelReferenceViewer} from "@cozemble/data-paginated-editor";
    import {slotEditorRegistry, slotViewerRegistry} from "@cozemble/model-assembled";
    import {setAllModelViews} from "./stores/allModelViews";
    import {recordFilteringComponentStore} from "./stores/recordFilteringComponentStore";
    import type {EventSourcedModelStore} from "./types";
    import {customNaming} from "@cozemble/model-editor";
    import {contextHelper} from "./stores/contextHelper";

    export let models: EventSourcedModelStore
    export let modelViews: Writable<ModelView[]>
    export let systemConfiguration: SystemConfiguration
    export let userId: string
    export let navbarState: Writable<string | null> = writable(null)
    export let permitModelling = writable(true)
    export let recordFilteringComponent: any | null = null
    export let showDevConsole = writable(false)

    currentUserId.set(userId)
    setAllEventSourcedModels(models)
    systemConfigurationStore.set(systemConfiguration)
    setAllModelViews(modelViews)
    recordFilteringComponentStore.set(recordFilteringComponent)
    contextHelper.setPermitModelling(permitModelling)
    contextHelper.setShowDevConsole(showDevConsole)

    onMount(() => {
        slotViewerRegistry.register('model.reference', ModelReferenceViewer)
        slotEditorRegistry.register('model.reference', ModelReferenceEditor)
        customNaming("Table", "Tables")
    })
</script>

<DataTableInner {navbarState}/>
