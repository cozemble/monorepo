<script lang="ts">
    import type {DataRecord, ModelId, ModelView, ModelViewId} from "@cozemble/model-core";
    import CreateModelSummaryView from "./CreateModelSummaryView.svelte";
    import EditModelSummaryView from "./EditModelSummaryView.svelte";
    import {onMount} from "svelte";
    import {loadRecords} from "../data/loadRecords";
    import SummaryCardPreview from "./SummaryCardPreview.svelte";

    export let tenantId: string
    export let modelId: ModelId
    export let summaryView: ModelView | null
    export let summaryViewCreated: (template: string) => Promise<void>
    export let summaryViewEdited: (viewId: ModelViewId, template: string) => Promise<void>
    let templateString = summaryView ? maybeGetTemplateString(summaryView) : ''
    let sampleRecords: DataRecord[] = []
    let mounted = false

    function maybeGetTemplateString(summaryView: ModelView) {
        if (summaryView.view._type === "summary.view") {
            return summaryView.view.view.template
        }
        return "";
    }


    function summaryViewTemplateChanged(event: CustomEvent) {
        templateString = event.detail
    }

    onMount(async () => {
        const loadRecordsResponse = await loadRecords(tenantId, modelId.value)
        const loadedRecords = loadRecordsResponse.records
        sampleRecords = loadedRecords.slice(0, 3)
        mounted = true
    })
</script>

<div class="flex">
    <div class="flex flex-col">
        <h4>Summary card HTML</h4>
        {#if summaryView}
            <EditModelSummaryView {modelId} {summaryView} saveHandler={summaryViewEdited}
                                  on:templateChanged={summaryViewTemplateChanged} on:cancel/>
        {:else}
            <CreateModelSummaryView {modelId} saveHandler={summaryViewCreated}
                                    on:templateChanged={summaryViewTemplateChanged} on:cancel/>
        {/if}
    </div>
    <div class="ml-5">
        {#if mounted}
            <h4>Preview</h4>
            {#if sampleRecords.length === 0}
                <label class="label">
                    <span class="label-text-alt">There are no records to preview</span>
                </label>
            {:else}
                {#each sampleRecords as sampleRecord, index}
                    <div class="sample-record p-2">
                        <SummaryCardPreview record={sampleRecord} {index} template={templateString}/>
                    </div>
                {/each}
            {/if}
        {/if}
    </div>
</div>

<style>
    .sample-record {
        border-bottom: solid 1px #e5e7eb;
    }
</style>