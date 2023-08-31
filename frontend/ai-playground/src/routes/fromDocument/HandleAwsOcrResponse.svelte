<script lang="ts">
    import OcrJsonCorrection from "../ocr-as-html/OcrJsonCorrection.svelte";
    import type {Writable} from "svelte/store";
    import type {Page} from "@cozemble/backend-aws-ocr-types";

    export let pages: Writable<Page[]>
</script>
<OcrJsonCorrection {pages} on:actions/>
