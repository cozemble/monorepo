<script lang="ts">


    import {actions, extendSchema} from "../types";
    import {writable} from "svelte/store";
    import {zodToFom} from "$lib/fom/zodToFom";
    import FomForm from "$lib/fom/components/FomForm.svelte";
    import {derived, type Readable} from "svelte/store";
    import type {FomArray, FomIssue} from "$lib/fom/Fom";
    import {z} from "zod";


    const object = writable([] as any)
    export let showErrors = writable(false)

    $: schema = extendSchema(zodToFom(actions), $object) as FomArray

    const errors: Readable<FomIssue[]> = derived(object, o => {
        console.log({o})
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

</script>

<label class="label">Show errors</label>
<input type="checkbox" bind:checked={$showErrors}/>
<FomForm {schema} {object} {errors} {showErrors} rootItemName="Action"/>


<div class="mt-4">
    <pre>{JSON.stringify($object, null, 2)}</pre>
</div>

<div>
    <pre>{JSON.stringify(schema, null, 2)}</pre>
</div>