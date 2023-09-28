<script lang="ts">

    import type {AwsOcrResponse} from "../aws-ocr/awsOcrTypes";
    import GenerateFirstGuessJson from "./genai/GenerateFirstGuessJson.svelte";
    import {jsonToHtml} from "../fromDocument/jsonToHtml";
    import {formatJson, json, partial, type PartialJson} from "../fromDocument/partialJson";
    import {createEventDispatcher} from "svelte";

    export let awsOcrResponse: AwsOcrResponse
    let generateFirstGuessJson = true
    const html = jsonToHtml(awsOcrResponse.json.pages)
    let firstGuessJson: PartialJson | null = null
    const dispatch = createEventDispatcher()
    let jsonContainerDir: HTMLDivElement

    function firstGuessJsonGenerated(event: CustomEvent) {
        firstGuessJson = json(event.detail)
        generateFirstGuessJson = false
        dispatch('generationComplete')
        setTimeout(() => {
            jsonContainerDir.scrollTop = jsonContainerDir.scrollHeight
        }, 100)
        setTimeout(() => {
            jsonContainerDir.scrollTop = 0
        }, 1000)
    }

    function firstGuessJsonPartial(event: CustomEvent) {
        firstGuessJson = partial(event.detail)
        dispatch('generating', {description: "Generating First Guess Json"})
        jsonContainerDir.scrollTop = jsonContainerDir.scrollHeight
    }

</script>

{#if generateFirstGuessJson}
    <GenerateFirstGuessJson {html} on:generated={firstGuessJsonGenerated} on:partial={firstGuessJsonPartial}/>
{/if}
<div class="border overflow-y-scroll json-container" bind:this={jsonContainerDir}>
    {#if firstGuessJson}
        <pre>{formatJson(firstGuessJson)}</pre>
    {/if}
</div>

<style>
    .json-container {
        max-height: 800px;
    }
</style>