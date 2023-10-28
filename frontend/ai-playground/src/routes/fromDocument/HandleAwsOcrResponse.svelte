<script lang="ts">
    import OcrJsonCorrection from "../ocr-as-html/OcrJsonCorrection.svelte";
    import type {Writable} from "svelte/store";
    import type {Page} from "@cozemble/backend-aws-ocr-types";
    import type {Action} from "../ocr-as-html/ocrCorrectiveActions";

    export let pages: Writable<Page[]>
    export let initialActions:Action[]
</script>

<!-- 
    @component
    Display OCR result and allow corrections to be made
    - Wraps `OcrJsonCorrection` from `/ocr-as-html` route 
 -->

<OcrJsonCorrection {pages} {initialActions} on:actions/>
