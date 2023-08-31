<script lang="ts">
    import {goto} from "$app/navigation";
    import type {AwsOcrResponse} from "../aws-ocr/awsOcrTypes";
    import HandleAwsOcrResponse from "./HandleAwsOcrResponse.svelte";

    let errorMessage: string | null = null
    let file: File | null = null;
    let awsOcrResponse: AwsOcrResponse | null = null
    let doingOcr = false
    let imageUrl: string | null = null

    function init(element: HTMLInputElement) {
        element.focus()
    }

    async function upload() {
        if (!file) {
            return;
        }
        doingOcr = true;

        const formData = new FormData();
        formData.append('image', file[0]);
        imageUrl = URL.createObjectURL(file[0]);

        const response = await fetch('/aws-ocr', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            awsOcrResponse = await response.json();
            // await figureOutDatabaseStructure()
        } else {
            errorMessage = 'Error occurred during OCR processing.';
        }
    }

    // async function figureOutDatabaseStructure() {
    //     if (!ocrResult) {
    //         return;
    //     }
    //     const response = await fetch('/fromDocument', {
    //         method: 'POST',
    //         body: JSON.stringify({html: ocrResult})
    //     });
    //
    //     if (response.ok) {
    //         const result = await response.json();
    //         onSchemaText(result.result)
    //     } else {
    //         errorMessage = 'Error occurred during database structure processing.';
    //     }
    // }

    // function onSchemaText(schemaText: string) {
    //     const schema = JSON.parse(schemaText)
    //     const converted = convertSchemaToModels(schema)
    //     reconfigureApp(converted)
    //     newGenerationSessionId()
    //     goto("/fromDocument/data")
    // }

    function cancel() {
        goto("/")
    }
</script>

<div class="grid h-screen place-items-center w-5/6 mx-auto mb-8">
    <div class="flex flex-col">
        {#if doingOcr}
            {#if awsOcrResponse === null}
                <h1 class="text-center mb-4">Performing OCR</h1>
            {:else}
                <h1 class="text-center mb-4">OCR Post Processing</h1>
                <HandleAwsOcrResponse {awsOcrResponse} />
            {/if}
        {:else}
            <h1 class="text-center mb-4">Upload your document</h1>
            <p class="text-center mb-8"><em>I will figure out what data is in it, and create a database for you</em></p>

            <input type="file" class="input input-bordered input-lg pt-3" bind:files={file} use:init/>
            <button class="btn btn-primary mt-4 btn-lg" on:click={upload}>
                Upload
            </button>
        {/if}
        <button class="btn btn-secondary mt-4 btn-lg" on:click={cancel}>
            Cancel
        </button>
        {#if errorMessage}
            <p class="text-center text-red-500 mt-4">{errorMessage}</p>
        {/if}
    </div>
</div>

<style>
    img {
        max-width: 100px;
        max-height: 100px;
    }
</style>