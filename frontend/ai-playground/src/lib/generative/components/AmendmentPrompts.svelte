<script lang="ts">
    import {modelStore, navbarState, replicatedRecords} from "$lib/generative/stores";
    import {convertModelToJsonSchema} from "$lib/convertModelToJsonSchema";
    import {
        convertSchemaToModels,
        existingModelIdMap,
        looksLikeJsonSchema,
        reconfigureApp
    } from "$lib/generative/components/helpers";
    import {applyAmendment} from "$lib/generative/components/applyAmendment";
    import {goto} from "$app/navigation";
    import {generateData} from "$lib/generative/generateData";
    import {setCurrentAiChatRequest} from "$lib/chat/ChatTypes";
    import type {JustErrorMessage, Value} from "@cozemble/lang-util";

    $: currentModel = $modelStore.models.find(m => m.model.id.value === $navbarState)

    let prompt = ""

    async function onChatResponse(response: JustErrorMessage | Value) {
        if(response._type === 'value') {
            const converted = convertSchemaToModels(response.value, existingModelIdMap($modelStore.models))
            prompt = ""
            await applyAmendment(converted)
        }
    }

    async function applyChange() {
        if (prompt.length > 3 && currentModel) {
            try {
                const allModels = $modelStore.models.map(m => m.model)
                const existingSchema = convertModelToJsonSchema(currentModel.model, allModels)
                const payload = {existingSchema, promptText: prompt}
                setCurrentAiChatRequest("/amend", payload, onChatResponse, looksLikeJsonSchema)
            } catch (e: any) {
                console.error(e)
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
        const allModels = $modelStore.models.map(m => m.model)
        await generateData(allModels, currentModel.model, $replicatedRecords)

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
            <button class="btn btn-primary" on:click={applyChange}>
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
    </div>
{/if}

<style>
    .input {
        width: calc(1ch * 50); /* adjust 10 to the number of characters you want */
    }
</style>