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
    import {createEventDispatcher} from "svelte";
    import {toSectionedJson} from "./toSectionedJson";
    import {zodErrors} from "./zodErrors";

    export let pages: Writable<Page[]>
    export let initialActions:Action[]
    export let actions: Writable<Action[]> = writable(initialActions)
    const dispatch = createEventDispatcher()
    let preview: "html" | "json" = "html"

    const errors = zodErrors(actionsType,actions)

    const mutatedPages = derived([pages, actions, errors], ([pages, actions, errors]) => {
        return applyCorrections(actions, errors, pages)
    })

    function continuousActionDispatch(actions: Action[], errors: FomIssue[]) {
        if (errors.length === 0) {
            dispatch("actions", actions)
        }
    }

    $: continuousActionDispatch($actions, $errors)
</script>

<div class="flex">
    <div>
        <div class="mt-4 mx-auto">
            <h4 class="mx-auto">OCR Corrective Actions</h4>
        </div>
        <OcrCorrections {actions} on:actions/>
    </div>

    <div class="flex flex-col ml-8 overflow-y-auto h-5/6">
        <div class="mt-4 mx-auto">
            <div class="tabs ">
                <button class="tab tab-lg tab-lifted" class:tab-active={preview === "html"}
                   on:click={() => preview = "html"}>HTML Preview</button>
                <button class="tab tab-lg tab-lifted" class:tab-active={preview === "json"}
                   on:click={() => preview = "json"}>JSON Preview</button>
            </div>
        </div>
        <div>
            {#if preview === "html"}
                <RenderOcrJson pages={$mutatedPages}/>
            {:else}
                <pre class="text-xs"><code>{JSON.stringify(toSectionedJson($mutatedPages), null, 2)}</code></pre>
            {/if}
        </div>
    </div>
</div>