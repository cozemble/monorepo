<script lang="ts">
    import type {Page} from "@cozemble/backend-aws-ocr-types";
    import RenderOcrPage from "./RenderOcrPage.svelte";

    export let pages: Page[]
</script>
{#each pages as page}
    <RenderOcrPage {page} />
{/each}

