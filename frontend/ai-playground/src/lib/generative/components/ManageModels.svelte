<script lang="ts">
    import {
        modelStore,
        modelViews,
        navbarState,
        permitModelling,
        showDevConsole,
        systemConfiguration
    } from "$lib/generative/stores";
    import {DataTable, RecordFilteringPanel} from "@cozemble/frontend-datatable";
    import AmendmentPrompts from "$lib/generative/components/AmendmentPrompts.svelte";
</script>

<div class="m-5">
    <AmendmentPrompts />
</div>

<div class="m-5">
    <DataTable models={modelStore}
               {modelViews}
               systemConfiguration={$systemConfiguration}
               {permitModelling}
               {showDevConsole}
               {navbarState}
               userId="test"
               recordFilteringComponent={RecordFilteringPanel}/>
</div>