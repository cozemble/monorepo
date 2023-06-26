<script lang="ts">
    import {modelStore, navbarState, replicatedRecords} from "$lib/generative/stores";
    import {convertModelToJsonSchema} from "$lib/convertModelToJsonSchema";
    import {convertSchemaToModels, existingModelIdMap} from "$lib/generative/components/helpers";
    import {applyAmendment} from "$lib/generative/components/applyAmendment";
    import {goto} from "$app/navigation";
    import {generateData} from "$lib/generative/generateData";


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
                    prompt = ""
                    await applyAmendment(converted)
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

    function startOver() {
        goto("/?startOver=true")
    }

    async function onGenerateData() {
        if(!currentModel) {
            return
        }
        hideDropdown()
        generating = true
        try {
            const allModels = $modelStore.models.map(m => m.model)
            await generateData(allModels, currentModel.model, $replicatedRecords)

        } finally {
            generating = false
        }

    }

    function hideDropdown() {
        (document.activeElement as HTMLElement).blur();
    }
</script>

{#if currentModel}
    <div class="flex flex-col">
        <h4 class="text-center mb-2">What changes would you like to make to your {currentModel.model.pluralName.value}
            table?</h4>
        <div class="mx-auto ">
            <input type="text text-center" class="input-bordered input"
                   placeholder="e.g. add/remove fields X, Y, Z" bind:value={prompt}
                   on:keydown={keyDownOnInput}/>
        </div>
        <div class="mx-auto mt-2">
            <button class="btn btn-primary" on:click={applyChange} disabled={generating}>
                {#if generating}
                    <span class="loading loading-spinner"></span>
                {/if}
                Apply change
            </button>
            <div class="dropdown">
                <label tabindex="0" class="btn btn-ghost btn-active m-1">Other options</label>
                <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li on:click={onGenerateData}><a>Generate data</a></li>
                    <li on:click={startOver}><a>Start over</a></li>
                </ul>
            </div>
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