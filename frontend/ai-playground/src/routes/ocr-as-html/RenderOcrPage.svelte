<script lang="ts">
    import type {Page} from "@cozemble/backend-aws-ocr-types";
    import RenderOcrItem from "./RenderOcrItem.svelte";

    export let page: Page
</script>

{#each page.items as item}
    <RenderOcrItem {item} />
{/each}