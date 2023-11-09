<script lang="ts">
    import type {Page} from "@cozemble/backend-aws-ocr-types";
    import StreamingJson from "./StreamingJson.svelte";
    import {jsonToHtml} from "../fromDocument/jsonToHtml";

    export let pages: Page[]
    const pagesWithTruncatedTables = pages.map(p => ({
        ...p, items: p.items.map(i => {
            if (i._type === "table") {
                return {...i, rows: i.rows.slice(0, 1)}
            }
            return i;
        })
    }))
    const html = jsonToHtml(pagesWithTruncatedTables);
</script>


<!-- 
    @component
    Analyze each of the given sections
    - `on:completion`: Dispatched when the analysis is complete
 -->

<h3 class="mx-auto">Looking for sections in the document....</h3>

<StreamingJson api="/genai/sections/guessSections" body={{html}} on:completion/>
