<script lang="ts">
    import type {Page} from "@cozemble/backend-aws-ocr-types";
    import StreamingJson from "./StreamingJson.svelte";
    import {jsonToHtml, type WordClass} from "../fromDocument/jsonToHtml";
    import type {LabelledKeywordResponse} from "../genai/sections/labelKeywords/+server";
    import {linesOnly} from "./helpers";
    import {writable} from "svelte/store";
    import {type BoundingBox, extractParagraphs, getBoundingBox, groupBySections, type Paragraph} from "./scratch/sectionFinder";

    export let pages: Page[]
    const scanPercentageComplete = writable(0)
    const stylePrefix = `<style>
            .text-box {
                 font-size: x-small;
                 white-space: nowrap;
            }
            .fixed-word {
                font-weight: bold;
            }
            </style>`
    const pagesWithLines = pages.map(page => linesOnly(page))
    let html = stylePrefix + jsonToHtml(pagesWithLines);
    const assistantSteps = ['scanForFixedWords', 'explainToUser']
    let currentAssistantStep = assistantSteps[0]

    function onKeywordLabellingComplete(event: CustomEvent<string>) {
        const response: LabelledKeywordResponse[] = JSON.parse(event.detail)
        const wordClasses: WordClass[] = response.map(r => ({
            paragraphNumber: r.paragraphNumber,
            word: r.fixedWord,
            clazz: 'fixed-word'
        }))
        const pagesWithLines = pages.map(page => linesOnly(page))
        html = stylePrefix + jsonToHtml(pagesWithLines, wordClasses)
        if (scanLineDiv) {
            scanLineDiv.style.display = 'none';
        }
        nextAssistantStep()
        showInitialBoundingBoxes()
    }

    function showInitialBoundingBoxes() {
        paragraphs = extractParagraphs(html);
        sections = groupBySections(paragraphs);
        $boundingBoxes = sections.map(getBoundingBox);
    }

    function nextAssistantStep() {
        const index = assistantSteps.indexOf(currentAssistantStep)
        if (index < assistantSteps.length - 1) {
            currentAssistantStep = assistantSteps[index + 1]
        }
    }


    function onPartialKeywordLabelling(event: CustomEvent<string>) {
        const maxParagraph = findMaxParagraphNumber(html);
        const currentParagraph = findMaxParagraphNumber(event.detail);
        $scanPercentageComplete = (currentParagraph / maxParagraph) * 100;
        if (scanLineDiv) {
            scanLineDiv.style.top = $scanPercentageComplete + '%';
        }
    }

    function findMaxParagraphNumber(dataString: string): number {
        const paragraphNumberRegex = /"para-(\d+)"/gm;
        let maxNumber = 0;

        let match;
        while ((match = paragraphNumberRegex.exec(dataString)) !== null) {
            const number = parseInt(match[1]);
            if (number > maxNumber) {
                maxNumber = number;
            }
        }

        return maxNumber
    }

    let scanLineDiv: HTMLDivElement;

    let paragraphs = [] as Paragraph[]
    let sections = [] as Paragraph[][]
    const boundingBoxes = writable([] as BoundingBox[])

</script>


<!-- 
    @component
    Analyze each of the given sections
    - `on:completion`: Dispatched when the analysis is complete
 -->

<div class="flex">
    <div class="flex flex-col">
        <h3>Document with tables removed</h3>
        <div class="html-container border rounded">
            <div bind:this={scanLineDiv} class="scan-line"></div>
            {#if $boundingBoxes.length > 0}
                {#each $boundingBoxes as boundingBox}
                    <div class="bounding-box rounded"
                         style="position:absolute;
                    top: {boundingBox.top}%;
                    left: {boundingBox.left}%;
                    width: calc({boundingBox.right}% - {boundingBox.left}%);
                    height: calc({boundingBox.bottom}% - {boundingBox.top}%);">
                    </div>
                {/each}
            {/if}
            {@html html}
        </div>
    </div>
    <div class="flex flex-col ml-4">
        {#if currentAssistantStep === 'scanForFixedWords'}
            <h3>Scanning document for "fixed words" ...</h3>
            <StreamingJson api="/genai/sections/labelKeywords" body={{html}} on:completion={onKeywordLabellingComplete}
                           on:partial={onPartialKeywordLabelling}/>
        {:else if currentAssistantStep === 'explainToUser'}
            <h3>Confirm sections</h3>
            <p>The document has been scanned for "fixed words", which are now marked in bold. These are words that we
                think will appear in all versions of this kind of document.</p><br/>
            <p>If you disagree with any of the fixed words, just click on them to toggle. Similarly, if a non-bold word
                SHOULD be a fixed work, click on that to toggle it.</p><br/>
            <p>We have also taken a guess at the likely sections in this document.  If you disagree with a section, you can reshape it or delete it</p><br/>
            <p>You can also add new sections by clicking the Add Section button</p><br/>
            <button class="btn btn-primary" on:click={nextAssistantStep}>Ok</button>
        {/if}
    </div>
</div>

<style>
    .html-container {
        width: 600px;
        height: 800px;
        position: relative;
    }

    .bounding-box {
        position: absolute;
        border: 1px solid red;
    }

    /* Updated style for the scan line div */
    .scan-line {
        position: absolute;
        left: 0;
        width: 100%;
        height: 3px; /* Adjust as needed */
        background-color: green; /* Or any color of your choice */
        transition: top 0.5s ease-out; /* Smooth transition for the 'top' property */
    }
</style>
