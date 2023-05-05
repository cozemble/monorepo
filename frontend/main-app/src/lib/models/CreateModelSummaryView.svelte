<script lang="ts">
    import type {ModelId} from "@cozemble/model-core";
    import {modelFns} from "@cozemble/model-api";
    import {eventSourcedModels} from "./modelsStore";
    import {toastNoticeStoreFns} from "../notices/toastNoticeStore";
    import SummaryViewExplainer from './SummaryViewExplainer.svelte'
    import {createEventDispatcher} from "svelte";

    export let saveHandler: (template: string) => Promise<void>
    export let template = ""
    export let modelId: ModelId
    const model = modelFns.findById($eventSourcedModels.map(e => e.model), modelId)
    const dispatch = createEventDispatcher()
    let error = ""
    let saving = false

    async function save() {
        if (template.length > 0) {
            try {
                saving = true
                error = ""
                await saveHandler(template)
                toastNoticeStoreFns.add("Summary card template saved", "success", 3000)
            } catch (e: any) {
                error = e.message
            } finally {
                saving = false
            }
        } else {
            error = "Please enter a template"
        }
    }

    function keyup() {
        error = ""
        setTimeout(() => dispatch("templateChanged", template))
    }

    function setTemplate(t: string) {
        template = t
        setTimeout(() => dispatch("templateChanged", template))
    }

    function cancel() {
        dispatch("cancel")
    }
</script>

<textarea class="textarea w-full input-bordered" rows="5" cols="80"
          placeholder="HTML template for how this model looks in a summary card" bind:value={template}
          on:keyup={keyup}></textarea>
<label class="label">
    <span class="label-text-alt">This is a template using {"{{...}}"} notation.  You have full access to the properties of {model.name.value}
        . </span>
</label>
<label class="label">
    <SummaryViewExplainer {model} {setTemplate}/>
</label>
{#if error}
    <div class="text-error mt-2">{error}</div>
{/if}
<div>
    <button class="btn btn-primary" on:click={save}>Save</button>
    <button class="btn btn-secondary" on:click={cancel}>Cancel</button>
</div>