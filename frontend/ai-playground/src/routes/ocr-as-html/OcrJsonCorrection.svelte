<script lang="ts">
    import type {Page} from "@cozemble/backend-aws-ocr-types";
    import type {Writable} from "svelte/store";
    import RenderOcrJson from "./RenderOcrJson.svelte";
    import OcrCorrections from "./OcrCorrections.svelte";
    import type {Action} from "./ocrCorrectiveActions";
    import {writable, derived, type Readable} from "svelte/store";
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

    const mutatedPages = derived([pages, actions, errors] , ([pages, actions, errors]) => {
        return applyCorrections(actions,errors,pages)
    })
</script>
<OcrCorrections {actions}/>
<RenderOcrJson pages={$mutatedPages}/>
