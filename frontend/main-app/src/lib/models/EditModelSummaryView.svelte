<script lang="ts">

    import type {ModelView, ModelViewId} from "@cozemble/model-core";
    import CreateModelSummaryView from "./CreateModelSummaryView.svelte";

    export let summaryView: ModelView
    export let saveHandler: (viewId: ModelViewId, template: string) => Promise<void>

    async function onSave(template: string) {
        await saveHandler(summaryView.id, template)
    }
</script>

{#if summaryView.view._type === "summary.view"}
    <CreateModelSummaryView template={summaryView.view.view.template} saveHandler={onSave}/>
{:else}
    <p>Not a summary view</p>
{/if}
