<script lang="ts">
    import {goto} from "$app/navigation";
    import type {AwsOcrResponse} from "../aws-ocr/awsOcrTypes";
    import UploadDocument from "../fromDocument/UploadDocument.svelte";

    let awsOcrResponse: AwsOcrResponse | null = null

    function cancel() {
        goto("/")
    }

    function ocrDone(event: CustomEvent<AwsOcrResponse>) {
        awsOcrResponse = event.detail
    }

</script>

<div class="grid h-screen place-items-center w-5/6 mx-auto mb-8">
    <div class="flex flex-col">
        {#if awsOcrResponse}
            <p>awsOcrResponse = {JSON.stringify(awsOcrResponse)}</p>
        {:else}
            <UploadDocument on:cancel={cancel} on:done={ocrDone}/>
        {/if}
    </div>
</div>

