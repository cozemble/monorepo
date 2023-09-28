<script lang="ts">
    import {goto} from "$app/navigation";
    import type {AwsOcrResponse} from "../aws-ocr/awsOcrTypes";
    import UploadDocument from "../fromDocument/UploadDocument.svelte";
    import ToJson from "./ToJson.svelte";
    import type {UploadAndOcrResponse} from "../fromDocument/types";
    import type {StashPdfResponse} from "@cozemble/backend-aws-ocr-types";

    let awsOcrResponse: AwsOcrResponse | null = null
    let upload: StashPdfResponse | null = null

    function cancel() {
        goto("/")
    }

    function ocrDone(event: CustomEvent<UploadAndOcrResponse>) {
        awsOcrResponse = event.detail.ocr
        upload = event.detail.upload
    }

</script>

<div class="grid h-screen place-items-center w-5/6 mx-auto mb-8">
    <div class="flex flex-col">
        {#if awsOcrResponse && upload}
            <ToJson {awsOcrResponse} {upload}/>
        {:else}
            <UploadDocument on:cancel={cancel} on:done={ocrDone}/>
        {/if}
    </div>
</div>

