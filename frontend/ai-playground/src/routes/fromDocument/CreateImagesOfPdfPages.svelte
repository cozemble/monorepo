<script lang="ts">
    import type {StashPdfResponse} from "@cozemble/backend-aws-ocr-types";
    import {createEventDispatcher, onMount} from "svelte";

    export let stashPdfResponse: StashPdfResponse
    const dispatch = createEventDispatcher()

    async function createImage(pdfS3Key: string) {
        const response = await fetch("/api/pdf-to-image", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({pdfS3Key})
        })
        if (!response.ok) {
            throw new Error(`Failed to create image for ${pdfS3Key}`)
        }
    }

    async function createImages() {
        await Promise.all(stashPdfResponse.pages.map(page => createImage(page.pdfS3Key)))
        dispatch('done')
    }

    onMount(createImages)
</script>