<script lang="ts">
    import type {Writable} from "svelte/store";
    import type {StashPdfResponse} from "@cozemble/backend-aws-ocr-types";
    import ImageForPdfPage from "./ImageForPdfPage.svelte";

    export let upload: StashPdfResponse
    export let pageIndex: Writable<number>

    $: page = upload.pages[$pageIndex - 1]

    function deltaPageIndex(delta: number) {
        $pageIndex += delta
    }
</script>
<div class="flex flex-col items-center">
    {#if page}
        {#key page.pdfS3Key}
            <ImageForPdfPage s3PdfKey={page.pdfS3Key}/>
            <div class="join mt-2">
                {#if $pageIndex > 1}
                    <button class="join-item btn" on:click={() => deltaPageIndex(-1)}>«</button>
                {/if}
                <button class="join-item btn">Page {$pageIndex}</button>
                {#if $pageIndex < upload.pages.length}
                    <button class="join-item btn" on:click={() => deltaPageIndex(1)}>»</button>
                {/if}
            </div>
        {/key}
    {/if}
</div>