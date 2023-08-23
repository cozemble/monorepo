<script lang="ts">
    import {z, type ZodIssue} from 'zod'
    import {derived, type Readable, writable} from 'svelte/store'
    import ZodObject from "./ZodObject.svelte";
    import {afterUpdate, getContext, setContext} from 'svelte'
    import {defaultComponentFinder} from "./componentPolicy";
    import {defaultErrorComponentFinder} from "./componentPolicy.js";

    export let object: any
    export let schema: z.ZodType<any, any>
    export let showErrors = writable(false)
    const objectStore = writable(object)
    const errorStore: Readable<ZodIssue[]> = derived(objectStore, o => {
        console.log({o})
        try {
            schema.parse(o)
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

    function ensureComponentFinder() {
        if (!getContext('component.finder')) {
            setContext('component.finder', defaultComponentFinder)
        }
        if (!getContext('error.component.finder')) {
            setContext('error.component.finder', defaultErrorComponentFinder)
        }
    }

    ensureComponentFinder()

    afterUpdate(() => console.log({errors: $errorStore}))
</script>
{#if schema instanceof z.ZodObject}
    <ZodObject bind:value={$objectStore} {schema} errors={$errorStore} showErrors={$showErrors}/>
{:else}
    to do {schema.constructor.name}
{/if}