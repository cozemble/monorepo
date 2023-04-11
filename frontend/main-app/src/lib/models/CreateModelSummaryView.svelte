<script lang="ts">
    import type {ModelId} from "@cozemble/model-core";
    import {modelFns} from "@cozemble/model-api";
    import {allModels} from "./modelsStore";
    import {explainTemplateForModel} from "./explainTemplateForModel";

    export let saveHandler: (template: string) => Promise<void>
    export let template = ""
    export let modelId: ModelId
    console.log({modelId})
    const model = modelFns.findById($allModels.map(e => e.model), modelId)
    let error = ""
    let info = ""
    let saving = false


    async function save() {
        if (template.length > 0) {
            try {
                saving = true
                error = ""
                info = ""
                await saveHandler(template)
                info = "Saved"
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
        info = ""
    }
</script>

<textarea class="textarea w-full input-bordered" rows="5" cols="80"
          placeholder="HTML template for how this model looks in a summary card" bind:value={template}
          on:keyup={keyup}></textarea>
<label class="label">
    <span class="label-text-alt">This is a template using {"{{...}}"} notation.  You have full access to the properties of {model.name.value}. </span>
</label>
<label class="label">
    <span class="label-text-alt">{explainTemplateForModel(model)}</span>
</label>
{#if error}
    <div class="text-error mt-2">{error}</div>
{/if}
{#if info}
    <div class="text mt-2">{info}</div>
{/if}
<button class="btn" on:click={save}>Save</button>