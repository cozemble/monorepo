<script lang="ts">
    import type {Page, StashedPdfPage} from "@cozemble/backend-aws-ocr-types";
    import PageOcrPreview from "./PageOcrPreview.svelte";

    export let page: StashedPdfPage
    export let pageIndex: number
    export let currentOcrPageIndex: number
    export let ocredPage: Page | undefined
</script>

<div class="flex">
    <div class="whitespace-nowrap">
        Page {pageIndex}
    </div>
    <div class="ml-4 w-full">
        {#if ocredPage}
            <div class="ocr-preview border overflow-scroll p-4">
                <PageOcrPreview {ocredPage} />
            </div>
        {:else if currentOcrPageIndex === pageIndex}
            <div class="text-red-500">
                Scanning...
            </div>
        {:else}
            <div class="text-gray-500">
                Queued...
            </div>
        {/if}
    </div>
</div>

<style>
    .ocr-preview {
        width: 100%;
        height: 250px;
    }
</style>