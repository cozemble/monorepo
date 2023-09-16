<script lang="ts">
    import type {Page} from "@cozemble/backend-aws-ocr-types";
    import RenderOcrPage from "./RenderOcrPage.svelte";
    import {strings} from "@cozemble/lang-util";
    import RenderOcrItem from "./RenderOcrItem.svelte";

    export let pages: Page[]

</script>


{#if pages.length > 0}
    {@const sections = pages[0].sections ?? []}
    {#each sections as section}
        <div class="flex flex-col border p-2 mb-2">
            <div><h6>{strings.camelcaseToSentenceCase(section.label)}</h6></div>
            <div>
            {#each section.items as item}
                <RenderOcrItem {item} />
            {/each}
            </div>
        </div>
    {/each}
    {#each pages as page}
        <RenderOcrPage {page}/>
    {/each}
{/if}

