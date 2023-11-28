<script lang="ts">
    import type {BoundingBox, Paragraph} from "./scratch/sectionFinder";
    import type {Writable} from "svelte/store";
    import type {LabelledKeywordResponse} from "../genai/sections/labelKeywords/+server";
    import {getBoundingBoxWords} from "./nearestFixedWords";

    export let selectedBoundingBox: BoundingBox;
    export let labelledKeywords: Writable<LabelledKeywordResponse[]>;
    export let paragraphs: Paragraph[]
    $: boundingBoxWords = getBoundingBoxWords(selectedBoundingBox, $labelledKeywords, paragraphs)
</script>
<div class="mt-4">
    <h5>This section:</h5>
    <ul>
        {#if boundingBoxWords.top}
            <li>Starts below the word <span class="fixed-word">{boundingBoxWords.top.text}</span></li>
        {:else}
            <li>Starts at the top of the document</li>
        {/if}
        {#if boundingBoxWords.left}
            <li>Starts to the left of <span class="fixed-word">{boundingBoxWords.left.text}</span></li>
        {:else}
            <li>Starts on the left of the document</li>
        {/if}
        {#if boundingBoxWords.right}
            <li>Ends before the word <span class="fixed-word">{boundingBoxWords.right.text}</span> on the right</li>
        {:else}
            <li>Ends at the right of the document</li>
        {/if}
        {#if boundingBoxWords.bottom}
            <li>Ends before the word <span class="fixed-word">{boundingBoxWords.bottom.text}</span> at the bottom</li>
        {:else}
            <li>Ends at the bottom of the document</li>
        {/if}
    </ul>
</div>
<style>
    .fixed-word {
        font-weight: bold;
    }
</style>