<script lang="ts">
    import type {Writable} from "svelte/store";
    import {derived, type Readable, writable} from "svelte/store";
    import type {Action} from "./ocrCorrectiveActions";
    import {actions as actionsType} from "./ocrCorrectiveActions";
    import type {FomArray, FomIssue} from "@cozemble/frontend-cozemble-forms";
    import {FomArrayForm, zodToFom} from "@cozemble/frontend-cozemble-forms";
    import {extendSchema} from "./fomFormExtender";
    import {z} from 'zod'
    import {afterUpdate} from "svelte";
    import ActionSummarizer from "./ActionSummarizer.svelte";

    export let actions: Writable<Action[]>
    const showErrors = writable(true)

    $: schema = extendSchema(zodToFom(actionsType) as FomArray, $actions)

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

    afterUpdate(() => {
        console.log("afterUpdate", schema)
    })
</script>

<FomArrayForm {schema} object={actions} {errors} {showErrors} rootItemName="Corrective Action"
              itemSummarizer={ActionSummarizer}/>
