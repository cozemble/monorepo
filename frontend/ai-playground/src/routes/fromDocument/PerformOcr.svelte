<script lang="ts">
    import type {Page, StashPdfResponse} from "@cozemble/backend-aws-ocr-types";
    import PageOcrProgress from "./PageOcrProgress.svelte";
    import {createEventDispatcher, onMount} from "svelte";
    import type {UploadAndOcrResponse} from "./types";

    export let stashPdfResponse: StashPdfResponse
    let currentOcrPageIndex = 1
    let ocredPages: Page[] = []
    const dispatch = createEventDispatcher()

    function cancel() {
        dispatch('cancel')
    }

    async function scanPage():Promise<Page[]> {
        const response = await fetch(`s3Ocr`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                s3Key: stashPdfResponse.pages[currentOcrPageIndex - 1].pdfS3Key
            })
        })
        const json = await response.json()
        return json.json.pages as Page[]
    }

    async function startScanning() {
        ocredPages = [...ocredPages, ...await scanPage()]
        currentOcrPageIndex++
        if (currentOcrPageIndex <= stashPdfResponse.pages.length) {
            await startScanning()
        }
        const response:UploadAndOcrResponse = {
            ocr: {
                json: {pages: ocredPages},
                html:""
            },
            upload: stashPdfResponse!
        }

        dispatch('done', response)
    }


    onMount(startScanning)
</script>


<!-- 
    @component
    Perform OCR on the PDF uploaded to S3
    - Automatically starts scanning on mount
    - `on:done`: dispatches with the OCR result when done
-->

<h1 class="text-center">Scanning your document</h1>

<div class="mx-auto mb-4">
    <button class="btn btn-secondary mt-4 btn-lg" on:click={cancel}>
        Cancel
    </button>
</div>

<!-- Display progress and results for each page -->
{#each stashPdfResponse.pages as page, pageIndex}
    <div class="mb-2">
        <PageOcrProgress {page} pageIndex={pageIndex + 1} {currentOcrPageIndex} ocredPage={ocredPages[pageIndex]}/>
    </div>
{/each}