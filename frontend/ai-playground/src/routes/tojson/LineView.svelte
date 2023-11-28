<script lang="ts">
    import type {LabelledKeywordResponse} from "../genai/sections/labelKeywords/+server";
    import type {Line} from "@cozemble/backend-aws-ocr-types";
    import type {Writable} from "svelte/store";

    export let line: Line
    export let index: number
    export let labelledKeywords: Writable<LabelledKeywordResponse[]>
    const paragraphNumber = `para-${index}`
    let prefix = ""
    let suffix = ""
    $: fixedWord = $labelledKeywords.find((lk) => lk.paragraphNumber === paragraphNumber)?.fixedWord ?? ""
    $: prefixWordAndSuffix(line.text, fixedWord)
    const left = line.boundingBox.left * 100
    const top = line.boundingBox.top * 100
    const width = line.boundingBox.width * 100
    const height = line.boundingBox.height * 100

    function prefixWordAndSuffix(word: string, fixedWord: string) {
        prefix = word.substring(0, word.indexOf(fixedWord))
        suffix = word.substring(word.indexOf(fixedWord) + fixedWord.length)
    }

    function onParagraphClick() {
        labelledKeywords.update((lks) => {
            const lk = lks.find((lk) => lk.paragraphNumber === paragraphNumber)
            if (lk) {
                lks.splice(lks.indexOf(lk), 1)
            } else {
                lks.push({paragraphNumber, fixedWord:line.text})
            }
            return lks
        })
    }
</script>

<p id="${paragraphNumber}" class="text-box" on:click={onParagraphClick}
   style="position: absolute; top: {top}%; left: {left}%; width: {width}%; height: {height}%;">
    {prefix}<span class="fixed-word">{fixedWord}</span>{suffix}
</p>

<style>
    .fixed-word {
        font-weight: bold;
    }

    .text-box {
        font-size: x-small;
        white-space: nowrap;
    }
</style>
