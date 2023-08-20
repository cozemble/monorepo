<script lang="ts">
    import {goto} from "$app/navigation";
    import {convertSchemaToModels, reconfigureApp} from "$lib/generative/components/helpers";
    import {propertyEssentials} from "../speech/schemas";
    import {newGenerationSessionId} from "$lib/generative/stores";

    let errorMessage: string | null = null
    let file: File | null = null;
    let ocrResult: string | null = null
    let processing = false
    let imageUrl: string | null = null

    function init(element: HTMLInputElement) {
        element.focus()
    }

    async function upload() {
        if (!file) {
            return;
        }
        processing = true;

        const formData = new FormData();
        formData.append('image', file[0]);
        imageUrl = URL.createObjectURL(file[0]);

        const response = await fetch('/aws-ocr', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            ocrResult = result.html;
            await figureOutDatabaseStructure()
        } else {
            errorMessage = 'Error occurred during OCR processing.';
        }
    }

    async function figureOutDatabaseStructure() {
        if (!ocrResult) {
            return;
        }
        const response = await fetch('/fromDocument', {
            method: 'POST',
            body: JSON.stringify({html: ocrResult})
        });

        if (response.ok) {
            const result = await response.json();
            onSchemaText(result.result)
        } else {
            errorMessage = 'Error occurred during database structure processing.';
        }
    }

    function onSchemaText(schemaText: string) {
        const schema = JSON.parse(schemaText)
        const converted = convertSchemaToModels(schema)
        reconfigureApp(converted)
        newGenerationSessionId()
        goto("/amend")
    }

    function cancel() {
        goto("/")
    }
</script>

<div class="grid h-screen place-items-center w-5/6 mx-auto mb-8">
    <div class="flex flex-col">
        {#if processing}
            <h1 class="text-center mb-4">Creating your database</h1>
            {#if imageUrl}
                <div class="flex">
                    <div class="flex flex-col">
                        <h2 class="text-lg">Image</h2>
                        <img src={imageUrl} class="mr-3 border rounded p-1"/>
                    </div>
                    <div class="flex flex-col">
                        <h2 class="text-lg">OCR Result</h2>
                        {#if ocrResult}
                            <textarea class="input input-bordered h-64 w-96">{ocrResult}</textarea>
                        {:else}
                            <p class="text-center">Processing...</p>
                        {/if}
                    </div>
                </div>
                {#if ocrResult}
                    <div class="flex flex-col">
                        <h2 class="text-lg text-center mt-4">Waiting for the AI to figure out the database structure</h2>
                        <p class="text-center"><em>This is using GPT-4 and can take up to 1 minute...</em></p>
                    </div>
                {/if}
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