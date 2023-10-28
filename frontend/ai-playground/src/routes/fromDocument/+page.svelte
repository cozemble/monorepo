<script lang="ts">
    import {goto} from "$app/navigation";
    import type {AwsOcrResponse} from "../aws-ocr/awsOcrTypes";
    import PostOcr from "./PostOcr.svelte";
    import UploadDocument from "./UploadDocument.svelte";
    import type {UploadAndOcrResponse} from "./types";

    /** OCR result from UploadDocument */
    let awsOcrResponse: AwsOcrResponse | null = null

    function cancel() {
        goto("/")
    }

    function ocrDone(event: CustomEvent<UploadAndOcrResponse>) {
        awsOcrResponse = event.detail.ocr
    }

</script>

<!-- 
    @component
    Upload a document and perform OCR \n
    After OCR, allows for corrections to be made
-->

<div class="grid h-screen place-items-center w-5/6 mx-auto mb-8">
    <div class="flex flex-col">
        {#if awsOcrResponse}
            <PostOcr {awsOcrResponse} on:cancel={cancel}/>
        {:else}
            <UploadDocument on:cancel={cancel} on:done={ocrDone}/>
        {/if}
    </div>
</div>

