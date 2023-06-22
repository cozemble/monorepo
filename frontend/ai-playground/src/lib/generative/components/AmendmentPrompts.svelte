<script lang="ts">
    import {modelStore, navbarState} from "$lib/generative/stores";
    import {convertModelToJsonSchema} from "$lib/convertModelToJsonSchema";
    import {convertSchemaToModels, existingModelIdMap, reconfigureApp} from "$lib/generative/components/helpers";

    $: currentModel = $modelStore.models.find(m => m.model.id.value === $navbarState)

    let prompt = ""
    let generating = false

    async function applyChange() {
        if (prompt.length > 3 && currentModel) {
            try {
                generating = true
                const allModels = $modelStore.models.map(m => m.model)
                const existingSchema = convertModelToJsonSchema(currentModel.model, allModels)
                const payload = {existingSchema, promptText: prompt}
                const fetched = await fetch("/amend", {
                    method: "POST",
                    body: JSON.stringify(payload),
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }

                })
                if (!fetched.ok) {
                    throw new Error("Something went wrong, please try again")
                }
                const fetchedResponse = await fetched.json()
                const amended = fetchedResponse.result
                if (amended) {
                    const parsed = JSON.parse(amended)
                    const converted = convertSchemaToModels(parsed, existingModelIdMap($modelStore.models))
                    reconfigureApp(converted)
                    prompt = ""
                }
            } catch (e: any) {
                console.error(e)
            } finally {
                generating = false
            }
        }
    }

    function keyDownOnInput(e: KeyboardEvent) {
        if (e.key === "Enter") {
            applyChange()
        }
    }

</script>
{#if currentModel}
    <div class="flex flex-col">
        <h4 class="text-center mb-2">What changes would you like to make to your {currentModel.model.pluralName.value}
            table?</h4>
        <div class="mx-auto ">
            <input type="text text-center" class="input-bordered input"
                   placeholder="Prompt to change {currentModel.model.pluralName.value} table" bind:value={prompt}
                   on:keydown={keyDownOnInput}/>
        </div>
        <div class="mx-auto mt-2">
            <button class="btn btn-primary" on:click={applyChange} disabled={prompt.length < 3 || generating}>
                {#if generating}
                    <span class="loading loading-spinner"></span>
                {/if}
                Apply change
            </button>
        </div>
        <div class="mx-auto">
            {#if generating}
                <p class="text-center mt-4">It can take up to 20 seconds for the AI to respond...</p>
            {/if}
        </div>
    </div>
{/if}

<style>
    .input {
        width: calc(1ch * 50); /* adjust 10 to the number of characters you want */
    }
</style>