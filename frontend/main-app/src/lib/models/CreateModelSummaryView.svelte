<script lang="ts">
    import type {ModelId} from "@cozemble/model-core";
    import {modelFns} from "@cozemble/model-api";
    import {allModels} from "./modelsStore";
    import {toastNoticeStoreFns} from "../notices/toastNoticeStore";
    import SummaryViewExplainer from './SummaryViewExplainer.svelte'

    export let saveHandler: (template: string) => Promise<void>
    export let template = ""
    export let modelId: ModelId
    const model = modelFns.findById($allModels.map(e => e.model), modelId)
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
    }

    function setTemplate(t: string) {
        template = t
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
<button class="btn" on:click={save}>Save</button>