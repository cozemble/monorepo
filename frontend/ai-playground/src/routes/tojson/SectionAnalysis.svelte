<script lang="ts">
    import type {Page} from "@cozemble/backend-aws-ocr-types";
    import StreamingJson from "./StreamingJson.svelte";
    import {jsonToHtml, type WordClass} from "../fromDocument/jsonToHtml";
    import type {LabelledKeywordResponse} from "../genai/sections/labelKeywords/+server";
    import {linesOnly} from "./helpers";
    import {writable} from "svelte/store";

    export let pages: Page[]
    const scanPercentageComplete = writable(0)
    const pagesWithTruncatedTables = pages.map(p => ({
        ...p, items: p.items.map(i => {
            if (i._type === "table") {
                return {...i, rows: i.rows.slice(0, 1)}
            }
            return i;
        })
    }))
    const stylePrefix = `<style>
.text-box {
 font-size: x-small;
 /* no wrap */
    white-space: nowrap;

}
            .fixed-word {
            font-weight: bold;
            }
            </style>`
    const pagesWithLines = pages.map(page => linesOnly(page))
    let html = stylePrefix + jsonToHtml(pagesWithLines);


    function onKeywordLabellingComplete(event: CustomEvent<string>) {
        const response: LabelledKeywordResponse[] = JSON.parse(event.detail)
        const wordClasses: WordClass[] = response.map(r => ({
            paragraphNumber: r.paragraphNumber,
            word: r.fixedWord,
            clazz: 'fixed-word'
        }))
        const pagesWithLines = pages.map(page => linesOnly(page))
        html = stylePrefix + jsonToHtml(pagesWithLines, wordClasses)
        if(scanLineDiv){
            scanLineDiv.style.display = 'none';
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

</script>


<!-- 
    @component
    Analyze each of the given sections
    - `on:completion`: Dispatched when the analysis is complete
 -->

<div class="flex">
    <div class="flex w-full flex-col">
        <h3>Document with tables removed</h3>
        <div class="html-container border rounded">
            <div bind:this={scanLineDiv} class="scan-line"></div>
            {@html html}
        </div>
    </div>
    <div class="flex w-full flex-col ml-4">
        <h3>Scanning document for "fixed words" ...</h3>
        <StreamingJson api="/genai/sections/labelKeywords" body={{html}} on:completion={onKeywordLabellingComplete}
                       on:partial={onPartialKeywordLabelling}/>
    </div>
</div>

<style>
    .html-container {
        width: 600px;
        height: 800px;
        position: relative;
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
