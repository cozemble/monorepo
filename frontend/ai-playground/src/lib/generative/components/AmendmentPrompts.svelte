<script lang="ts">
    import {modelStore, navbarState} from "$lib/generative/stores";
    import {amendmentPrompt} from "$lib/generative/GenerativeAiBackend";
    import {convertModelToJsonSchema} from "$lib/convertModelToJsonSchema";
    import {convertSchemaToModels, existingModelIdMap, reconfigureApp} from "$lib/generative/components/helpers";

    $: currentModel = $modelStore.models.find(m => m.model.id.value === $navbarState)

    let prompt = ""

    async function applyChange() {
        if (prompt.length > 0 && currentModel) {
            try {
                const allModels = $modelStore.models.map(m => m.model)
                const amended = await amendmentPrompt(convertModelToJsonSchema(currentModel.model, allModels), prompt)
                if (amended) {
                    const parsed = JSON.parse(amended)
                    const converted = convertSchemaToModels(parsed, existingModelIdMap($modelStore.models))
                    reconfigureApp(converted)
                    prompt = ""
                }
            } catch (e: any) {
                console.error(e)
            }
        }
    }

</script>
{#if currentModel}
    <div class="flex flex-col">
        <h4 class="text-center mb-2">What changes would you like to make to your {currentModel.model.pluralName.value}
            table?</h4>
        <div class="mx-auto ">
            <input type="text text-center" class="input-bordered input"
                   placeholder="Prompt to change {currentModel.model.pluralName.value} table" bind:value={prompt}/>
        </div>
        <div class="mx-auto mt-2">
            <button class="btn btn-primary" on:click={applyChange}>Apply change</button>
            <button class="btn btn-secondary">Add another table</button>
        </div>
    </div>
{/if}

<style>
    .input {
        width: calc(1ch * 50); /* adjust 10 to the number of characters you want */
    }
</style>