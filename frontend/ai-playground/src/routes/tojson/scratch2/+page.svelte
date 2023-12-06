<script lang="ts">

    import type {AwsOcrResponse} from "../../aws-ocr/awsOcrTypes";
    import DocumentView from "../DocumentView.svelte";
    import type {Page} from "@cozemble/backend-aws-ocr-types";
    import type {LabelledKeywordResponse} from "../../genai/sections/labelKeywords/+server";
    import {writable} from "svelte/store";
    import {type BoundingBox, extractParagraphs} from "../sectionFinder";
    import {jsonToHtml} from "../../fromDocument/jsonToHtml";
    import type {GptVisionSections} from "./types";
    import BoundingBoxView from "../BoundingBoxView.svelte";

    let awsOcrResponseString = ""
    let jsonString = ""
    let gptVisionSections = null as GptVisionSections | null
    let awsOcrResponse: AwsOcrResponse | null = null
    let pages: Page[] = []
    const labelledKeywords = writable([] as LabelledKeywordResponse[])
    const boundingBoxes = writable([] as BoundingBox[])
    let html = ""
    let htmlContainer: HTMLDivElement | null = null
    const selectedBoundingBox = writable(null as BoundingBox | null)


    $: if (awsOcrResponseString) {
        try {
            awsOcrResponse = JSON.parse(awsOcrResponseString)
            if (awsOcrResponse) {
                pages = awsOcrResponse.json.pages
                html = jsonToHtml(pages)
            }
        } catch (e) {
            console.error(e)
        }
    }

    $: if (jsonString) {
        try {
            gptVisionSections = JSON.parse(jsonString)
        } catch (e) {
            console.error(e)
        }
    }

    $: if(gptVisionSections && html.trim().length > 0) {
        const paragraphs = extractParagraphs(html);

        console.log(paragraphs)
    }
</script>

<div class="flex">
    <div class="flex flex-col">
        <label class="label">AWS OCR Response</label>
        <textarea class="input input-bordered" bind:value={awsOcrResponseString}></textarea>
    </div>
    <div class="flex flex-col">
        <label class="label">GPT Vision JSON</label>
        <textarea class="input input-bordered ml-4" bind:value={jsonString}></textarea>
    </div>
</div>
{#if pages.length > 0}
    <div class="html-container ml-8 border rounded p-4 mt-8" bind:this={htmlContainer}>
        {#each $boundingBoxes as boundingBox, index}
            <BoundingBoxView {boundingBox} {index} {htmlContainer} {boundingBoxes} {selectedBoundingBox}/>
        {/each}

        <DocumentView {pages} {labelledKeywords}/>
    </div>
{/if}

<style>
    .html-container {
        width: 600px;
        height: 800px;
        position: relative;
    }
</style>

