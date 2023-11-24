<script lang="ts">
    import {goto} from "$app/navigation";
    import type {AwsOcrResponse} from "../aws-ocr/awsOcrTypes";
    import UploadDocument from "../fromDocument/UploadDocument.svelte";
    import ToJson from "./ToJson.svelte";
    import type {UploadAndOcrResponse} from "../fromDocument/types";
    import type {StashPdfResponse} from "@cozemble/backend-aws-ocr-types";
    import JsonApiWizard from "./JsonApiWizard.svelte";
    import {jsonToHtml} from "../fromDocument/jsonToHtml";

    let awsOcrResponse: AwsOcrResponse | null = null
    let upload: StashPdfResponse | null = null

    function cancel() {
        goto("/")
    }

    function ocrDone(event: CustomEvent<UploadAndOcrResponse>) {
        awsOcrResponse = event.detail.ocr
        console.log({awsOcrResponse})
        upload = event.detail.upload
        const html = jsonToHtml(awsOcrResponse.json.pages)
        console.log({html})
    }

</script>

<!-- 
    @component
    Perform OCR on a document and suggest corrections
 -->

<div class="grid h-screen place-items-center w-5/6 mx-auto mb-8">
    <div class="flex flex-col">
        {#if awsOcrResponse && upload}
            <JsonApiWizard {awsOcrResponse} {upload}/>
        {:else}
            <UploadDocument on:cancel={cancel} on:done={ocrDone}/>
        {/if}
    </div>
</div>

