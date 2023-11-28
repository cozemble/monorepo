<script lang="ts">
    import type {Page} from "@cozemble/backend-aws-ocr-types";
    import type {LabelledKeywordResponse} from "../genai/sections/labelKeywords/+server";
    import {mandatory} from "@cozemble/lang-util";
    import {linesInPage} from "./helpers";
    import LineView from "./LineView.svelte";
    import type {Writable} from "svelte/store";

    export let pages: Page[]
    export let labelledKeywords: Writable<LabelledKeywordResponse[]>
    const page = mandatory(pages[0], "pages[0]")
    const lines = linesInPage(page)
</script>

{#each lines as line, index}
    <LineView {line} index={index + 1} {labelledKeywords}/>
{/each}