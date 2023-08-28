<script lang="ts">
    import type {Page} from "@cozemble/backend-aws-ocr-types";
    import type {Writable} from "svelte/store";
    import RenderOcrJson from "./RenderOcrJson.svelte";
    import OcrCorrections from "./OcrCorrections.svelte";
    import type {Action} from "./ocrCorrectiveActions";
    import {writable} from "svelte/store";

    export let pages: Writable<Page[]>
    export let actions: Writable<Action[]> = writable([])
</script>
<OcrCorrections {pages} {actions}/>
<RenderOcrJson pages={$pages}/>
