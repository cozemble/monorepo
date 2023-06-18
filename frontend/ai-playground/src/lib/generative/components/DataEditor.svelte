<script lang="ts">
    import type {Model} from "@cozemble/model-core";
    import {DataTable, RecordFilteringPanel} from "@cozemble/frontend-datatable";
    import {
        modelStore,
        modelViews,
        navbarState,
        permitModelling,
        showDevConsole,
        systemConfiguration
    } from "$lib/generative/stores";

    // export let model: Model
    // export let allModels: Model[]

</script>

<DataTable models={modelStore}
           {modelViews}
           systemConfiguration={$systemConfiguration}
           {permitModelling}
           {showDevConsole}
           {navbarState}
           userId="test"
           recordFilteringComponent={RecordFilteringPanel}/>