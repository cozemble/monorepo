<script lang="ts">
    import type {Page} from "@cozemble/backend-aws-ocr-types";
    import StreamingJson from "./StreamingJson.svelte";
    import {jsonToHtml} from "../fromDocument/jsonToHtml";
    import type {LabelledKeywordResponse} from "../genai/sections/labelKeywords/+server";
    import {linesOnly, type SectionAnalysisStep} from "./helpers";
    import {writable} from "svelte/store";
    import {
        type BoundingBox,
        extractParagraphs,
        getBoundingBox,
        groupBySections,
        type Paragraph
    } from "./scratch/sectionFinder";
    import {nearestBottom, nearestLeft, nearestRight, nearestTop} from "./nearestFixedWords";
    import DocumentView from "./DocumentView.svelte";
    import BoundingBoxView from "./BoundingBoxView.svelte";
    import SelectedBoundingBoxView from "./SelectedBoundingBoxView.svelte";
    import {type MouseDragHandler, NoOpMouseDragHandler} from "./MouseDragHandler";

    export let pages: Page[]
    const scanPercentageComplete = writable(0)
    const pagesWithLines = pages.map(page => linesOnly(page))
    const assistantSteps: SectionAnalysisStep[] = [{name: 'scanForFixedWords', documentDisabled: false}, {name: 'explainToUser', documentDisabled: true}, {name: 'configureSections', documentDisabled: false}]
    let currentAssistantStep = assistantSteps[0]
    const labelledKeywords = writable([] as LabelledKeywordResponse[])
    let html = jsonToHtml(pagesWithLines);
    const selectedBoundingBox = writable(null as BoundingBox | null)

    function onKeywordLabellingComplete(event: CustomEvent<string>) {
        $labelledKeywords = JSON.parse(event.detail)
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
        if ($boundingBoxes.length > 0) {
            const box = $boundingBoxes[0];
            const top = nearestTop(box, $labelledKeywords, paragraphs);
            const bottom = nearestBottom(box, $labelledKeywords, paragraphs);
            const left = nearestLeft(box, $labelledKeywords, paragraphs);
            const right = nearestRight(box, $labelledKeywords, paragraphs);
            console.log({top, bottom, left, right})
        }
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
    let htmlContainer: HTMLDivElement;

    let paragraphs = [] as Paragraph[]
    let sections = [] as Paragraph[][]
    const boundingBoxes = writable([] as BoundingBox[])

    let mouseDragHandler: MouseDragHandler = NoOpMouseDragHandler

    function onMouseDown(event: MouseEvent) {
        mouseDragHandler.onMouseDown(event)
    }

    function onMouseMove(event: MouseEvent) {
        mouseDragHandler.onMouseMove(event)
    }

    function onMouseUp(event: MouseEvent) {
        mouseDragHandler.onMouseUp(event)
    }

    function onDeleteSection(event: CustomEvent<BoundingBox>) {
        const index = $boundingBoxes.indexOf(event.detail)
        console.log({index, event, boundingBoxes:$boundingBoxes})
        if (index >= 0) {
            boundingBoxes.update(boundingBoxes => boundingBoxes.filter((_, i) => i !== index))
            $selectedBoundingBox = null
            console.log({boundingBoxes:$boundingBoxes})
        }
    }
</script>

<div class="flex">
    <div class="flex flex-col">
        <h3>Document with tables removed</h3>
        <div class="html-container border rounded" bind:this={htmlContainer}
             on:mousedown={onMouseDown}
             on:mousemove={onMouseMove}
             on:mouseup={onMouseUp}
             class:disabled={currentAssistantStep.documentDisabled}>
            <div bind:this={scanLineDiv} class="scan-line"></div>
            {#each $boundingBoxes as boundingBox, index}
                <BoundingBoxView {boundingBox} {index} {htmlContainer} {boundingBoxes} {selectedBoundingBox}/>
            {/each}
            <DocumentView pages={pagesWithLines} {labelledKeywords}/>
        </div>
    </div>
    <div class="flex flex-col ml-4">
        {#if currentAssistantStep.name === 'scanForFixedWords'}
            <h3>Scanning document for "fixed words" ...</h3>
            <StreamingJson api="/genai/sections/labelKeywords" body={{html}} on:completion={onKeywordLabellingComplete}
                           on:partial={onPartialKeywordLabelling}/>
        {:else if currentAssistantStep.name === 'explainToUser'}
            <h3>Short explainer...</h3>
            <p>The document has been scanned for "fixed words", which are now marked in bold. These are words that we
                think will appear in all versions of this kind of document.</p><br/>
            <p>If you disagree with any of the fixed words, just click on them to toggle. Similarly, if a non-bold word
                SHOULD be a fixed work, click on that to toggle it.</p><br/>
            <p>We have also taken a guess at the likely sections in this document. If you disagree with a section, you
                can reshape it or delete it</p><br/>
            <p>You can also add new sections by clicking the Add Section button</p><br/>
            <button class="btn btn-primary" on:click={nextAssistantStep}>Ok</button>
        {:else if currentAssistantStep.name === 'configureSections'}
            <h3>Configure sections</h3>
            {#if $selectedBoundingBox}
                <SelectedBoundingBoxView selectedBoundingBox={$selectedBoundingBox} {labelledKeywords} {paragraphs} on:deleteSection={onDeleteSection}/>
            {/if}
        {/if}
    </div>
</div>

<style>
    .html-container {
        width: 600px;
        height: 800px;
        position: relative;
    }

    .disabled {
        opacity: 0.5;
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
