<script lang="ts">
    import {z, type ZodIssue} from 'zod'
    import {derived, type Readable, writable} from 'svelte/store'
    import {afterUpdate, getContext, setContext} from 'svelte'
    import {defaultComponentFinder, defaultErrorComponentFinder} from "$lib/containers/componentPolicy";
    import ZodObject from "$lib/containers/ZodObject.svelte";
    import RootZodArray from "$lib/containers/RootZodArray.svelte";

    export let object: any
    export let schema: z.ZodType<any, any>
    export let showErrors = writable(false)
    export let rootItemName = null as string | null
    const objectStore = writable(object)
    const errorStore: Readable<ZodIssue[]> = derived(objectStore, o => {
        console.log({o})
        object = o
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
{:else if schema instanceof z.ZodArray}
    {#if rootItemName}
        {#if Array.isArray(object)}
            <RootZodArray bind:value={$objectStore} {schema} errors={$errorStore} showErrors={$showErrors}
                          itemName={rootItemName}/>
        {:else }
            <p class="text-error">Root type is an array, and the supplied object was of type {typeof object}</p>
        {/if}
    {:else}
        <p class="text-error">No rootItemName supplied to root form, and root type is an array</p>
    {/if}
{:else}
    ZodForm: to do {schema.constructor.name}
{/if}