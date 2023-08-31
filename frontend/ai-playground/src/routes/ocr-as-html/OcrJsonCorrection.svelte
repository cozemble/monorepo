<script lang="ts">
    import type {Page} from "@cozemble/backend-aws-ocr-types";
    import type {Writable} from "svelte/store";
    import {derived, type Readable, writable} from "svelte/store";
    import RenderOcrJson from "./RenderOcrJson.svelte";
    import OcrCorrections from "./OcrCorrections.svelte";
    import type {Action} from "./ocrCorrectiveActions";
    import {actions as actionsType} from "./ocrCorrectiveActions";
    import type {FomIssue} from "@cozemble/frontend-cozemble-forms";
    import {applyCorrections} from "./applyCorrections";
    import {z} from "zod";

    export let pages: Writable<Page[]>
    export let actions: Writable<Action[]> = writable([])

    const errors: Readable<FomIssue[]> = derived(actions, o => {
        console.log({o})
        try {
            actionsType.parse(o)
            return []
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return error.errors
            } else {
                console.error("Some other error:", error);
                return []
            }
        }
    })

    const mutatedPages = derived([pages, actions, errors], ([pages, actions, errors]) => {
        return applyCorrections(actions, errors, pages)
    })
</script>
<div class="flex">
    <div>
        <div class="mt-4 mx-auto">
            <h4 class="mx-auto">OCR Corrective Actions</h4>
        </div>
        <OcrCorrections {actions}/>
    </div>
    <div class="flex flex-col ml-8">
        <div class="mt-4 mx-auto">
            <h4 class="mx-auto">HTML Preview</h4>
        </div>
        <div>
        <RenderOcrJson pages={$mutatedPages}/>
        </div>
    </div>
</div>