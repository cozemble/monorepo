<script lang="ts">
    import type {StashPdfResponse} from "@cozemble/backend-aws-ocr-types";
    import PerformOcr from "./PerformOcr.svelte";
    import {createEventDispatcher} from "svelte";
    import CreateImagesOfPdfPages from "./CreateImagesOfPdfPages.svelte";
    import type {UploadAndOcrResponse} from "./types";

    let errorMessage: string | null = null
    let file: File | null = null;
    let stashPdfResponse: StashPdfResponse | null = null
    let uploadingPdf = false
    const dispatch = createEventDispatcher()

    let isLocalhost = false

    if (typeof window !== 'undefined') {
        isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    }

    function init(element: HTMLInputElement) {
        element.focus()
    }

    async function upload() {
        if (!file) {
            return;
        }
        uploadingPdf = true;

        const formData = new FormData();
        formData.append('image', file[0]);

        const response = await fetch('/stashPdf', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            stashPdfResponse = await response.json();
        } else {
            errorMessage = 'Error occurred during OCR processing.';
        }
    }

    function cancel() {
        dispatch('cancel')
    }

    let ocrOutcomeShortcut: string | null = null

    function useShortcut() {
        const json = JSON.parse(ocrOutcomeShortcut || '{}').json
        const awsOcrResponse = {
            json,
            html: ""
        }
        const response:UploadAndOcrResponse = {
            ocr: awsOcrResponse,
            upload: stashPdfResponse!
        }
        dispatch('done', response)
    }
</script>

<!-- 
    @component
    Upload document and perform OCR
    - 'on:done': dispatches when OCR is complete with the OCR outcome
    - Optional JSON text input to bypass OCR
 -->

{#if uploadingPdf}
    {#if stashPdfResponse === null}
        <h1 class="text-center mb-4">Uploading your file</h1>
        <button class="btn btn-secondary mt-4 btn-lg" on:click={cancel}>
            Cancel
        </button>
    {:else}
        <CreateImagesOfPdfPages {stashPdfResponse} />
        <PerformOcr {stashPdfResponse} on:cancel on:done/>
    {/if}

{:else}
    <h1 class="text-center mb-4">Upload your document</h1>
    <p class="text-center mb-8"><em>I will figure out what data is in it, and create a database for you</em>
    </p>

    <input type="file" class="input input-bordered input-lg pt-3" bind:files={file} use:init/>
    <button class="btn btn-primary mt-4 btn-lg" on:click={upload}>
        Upload
    </button>
    <button class="btn btn-secondary mt-4 btn-lg" on:click={cancel}>
        Cancel
    </button>
{/if}

{#if errorMessage}
    <p class="text-center text-red-500 mt-4">{errorMessage}</p>
{/if}

{#if isLocalhost}
    <hr class="w-full mt-8"/>
    <div class="flex flex-col items-center mt-4">
        <div>
            <h4>or paste OCR outcome json here</h4>
        </div>
        <div>
            <textarea class="textarea textarea-bordered" rows="10" cols="50" bind:value={ocrOutcomeShortcut}></textarea>
        </div>
        <div>
            <button class="btn" on:click={useShortcut}>Use shortcut</button>
        </div>
    </div>
{/if}