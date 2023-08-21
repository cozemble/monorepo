<script lang="ts">
    import type {BlockItem} from "@cozemble/backend-aws-ocr-types";
    import RenderOcrTable from "./RenderOcrTable.svelte";

    export let item: BlockItem
</script>
{#if item._type === "line"}
    <p>{item.text}</p>
{:else if item._type === "table"}
    <RenderOcrTable table={item}/>
{/if}