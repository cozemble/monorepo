<script lang="ts">
    import {allModels} from "./host";
    import DataPanelInner from './DataPanelInner.svelte'
    import {paginatedEditorHost, records} from "./recordsHost";

    $: actualModels = $allModels.map(m => m.model)
</script>
{#if actualModels.length === 0}
    <p>When you have created your first model, you will be able to edit data here</p>
{:else}
    <DataPanelInner models={actualModels} model={actualModels[0]} records={$records} {paginatedEditorHost}/>
{/if}
