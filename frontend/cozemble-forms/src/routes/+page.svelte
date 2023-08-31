<script lang="ts">
    import {derived, type Readable, writable} from "svelte/store";
    import {zodToFom} from "../lib/fom/zodToFom";
    import type {FomArray, FomIssue} from "$lib/fom/Fom";
    import {z} from "zod";
    import {actions, extendSchema} from "./types";
    import FomArrayForm from "$lib/fom/components/FomArrayForm.svelte";
    import ActionSummarizer from "./ActionSummarizer.svelte";
    import {afterUpdate} from "svelte";

    const object = writable([] as any)
    export let showErrors = writable(true)

    $: schema = extendSchema(zodToFom(actions), $object) as FomArray

    const errors: Readable<FomIssue[]> = derived(object, o => {
        try {
            actions.parse(o)
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

    afterUpdate(() => console.log({object:$object, errors:$errors}))
</script>


<FomArrayForm {schema} {object} {errors} {showErrors} rootItemName="Action" itemSummarizer={ActionSummarizer}/>


