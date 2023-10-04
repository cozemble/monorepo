<script lang="ts">

    import type {AwsOcrResponse} from "../aws-ocr/awsOcrTypes";
    import GenerateFirstGuessJson from "./genai/GenerateFirstGuessJson.svelte";
    import {jsonToHtml} from "../fromDocument/jsonToHtml";
    import {formatJson, json, partial, type PartialJson} from "../fromDocument/partialJson";
    import {createEventDispatcher} from "svelte";
    import type {JsonSchema} from "@cozemble/model-core";
    import type {Writable} from "svelte/store";
    import GenerateJson from "../fromDocument/GenerateJson.svelte";

    export let awsOcrResponse: AwsOcrResponse
    export let jsonSchema: Writable<JsonSchema | null>
    export let generateJson: Writable<boolean>
    export let generateFirstGuessJson:Writable<boolean>
    export let generatedJson: Writable<PartialJson | null>
    const html = jsonToHtml(awsOcrResponse.json.pages)
    const dispatch = createEventDispatcher()
    let jsonContainerDir: HTMLDivElement

    function jsonGenerated(event: CustomEvent) {
        $generatedJson = json(event.detail)
        $generateFirstGuessJson = false
        dispatch('generationComplete')
        setTimeout(() => {
            jsonContainerDir.scrollTop = jsonContainerDir.scrollHeight
        }, 100)
        setTimeout(() => {
            jsonContainerDir.scrollTop = 0
        }, 1000)
    }

    function generatedJsonPartial(event: CustomEvent) {
        $generatedJson = partial(event.detail)
        dispatch('generating')
        jsonContainerDir.scrollTop = jsonContainerDir.scrollHeight
    }


</script>

{#if $generateFirstGuessJson}
    <GenerateFirstGuessJson {html} on:generated={jsonGenerated} on:partial={generatedJsonPartial}/>
{/if}
{#if $generateJson && $jsonSchema}
    <GenerateJson {html} schema={JSON.stringify($jsonSchema)} on:generated={jsonGenerated}
                  on:partial={generatedJsonPartial}/>
{/if}
<div class="border overflow-y-scroll json-container" bind:this={jsonContainerDir}>
    {#if $generatedJson}
        <pre>{formatJson($generatedJson)}</pre>
    {/if}
</div>

<style>
    .json-container {
        max-height: 800px;
    }
</style>