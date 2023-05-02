<script lang="ts">
    import type {Part} from "./htmlTemplateAsParts";
    import {modelPathFns} from "@cozemble/model-api";

    export let part: Part
</script>

{#if part._type === "model.path"}
    <div class="badge badge-ghost gap-2 p-3 mr-2">
        {modelPathFns.toDottedNamePath(part).value}
    </div>
{:else}
    <div class="badge gap-2 p-3 mr-2">
        {#if part.markup === '<br/>'}
            New line
        {:else}
            Space
        {/if}
    </div>
{/if}
