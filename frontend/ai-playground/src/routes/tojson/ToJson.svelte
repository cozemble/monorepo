<script lang="ts">
    import type {AwsOcrResponse} from "../aws-ocr/awsOcrTypes";
    import {writable} from "svelte/store";
    import PageImage from "./PageImage.svelte";
    import type {StashPdfResponse} from "@cozemble/backend-aws-ocr-types";
    import JsonPreview from "./JsonPreview.svelte";

    export let awsOcrResponse: AwsOcrResponse
    export let upload: StashPdfResponse
    const pageIndex = writable(1)
    let generating = false
    let generatingMessage = null as string | null

    function onGenerating(event: CustomEvent) {
        generating = true
        generatingMessage = event.detail.description
    }

    function onGenerationComplete() {
        generating = false
        generatingMessage = null
    }
</script>

<div class="flex p-8 overflow-x-scroll">
    <div>
        <h5>Document</h5>
        <h6>&nbsp;</h6>
        <PageImage {upload} {pageIndex}/>
    </div>
    <div class="ml-2 w-1/2">
        {#if generating}
            <h5>JSON....</h5>
        {:else}
            <h5>JSON</h5>
        {/if}
        {#if generatingMessage}
            <h6>{generatingMessage}</h6>
            {:else}
            <h6>&nbsp;</h6>
            {/if}
        <JsonPreview {awsOcrResponse} on:generating={onGenerating} on:generationComplete={onGenerationComplete}/>
    </div>
</div>