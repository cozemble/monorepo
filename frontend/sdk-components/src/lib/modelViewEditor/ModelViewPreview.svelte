<script lang="ts">
    import type {DataRecord, Model, ModelView} from "@cozemble/model-core";
    import type {Writable} from "svelte/store";
    import SummaryCardPreview from "./SummaryCardPreview.svelte";
    import {modelFns} from "@cozemble/model-api";

    export let sampleRecords: DataRecord[]
    export let models: Model[]
    export let modelView: Writable<ModelView>
    const model = modelFns.findById(models, $modelView.modelId)


</script>

{#if $modelView.view._type === 'summary.view' && $modelView.view.view._type === 'model.html.template'}
    <h6>This is how your {model.name.value} records will look</h6>

    {#if sampleRecords.length === 0}
        <label class="label">
            <span class="label-text-alt">There are no records to preview</span>
        </label>
    {:else}
        {#each sampleRecords as sampleRecord, index}
            <div class="sample-record p-2">
                <strong class="mr-3">{index + 1}.</strong><SummaryCardPreview {models} record={sampleRecord} {index} template={$modelView.view.view.template}/>
            </div>
        {/each}
    {/if}
{:else}
    <p>Don't know how to handle model view</p>
{/if}
