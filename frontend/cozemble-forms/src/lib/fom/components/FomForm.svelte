<script lang="ts">
    import type {FomArray, FomIssue, FomObject} from "../Fom";
    import {type Readable, writable, type Writable} from "svelte/store";
    import ArrayContainerInner from "./ArrayContainerInner.svelte";
    import {defaultComponentFinder, defaultErrorComponentFinder} from "./componentPolicy";
    import {getContext, setContext} from "svelte";

    export let schema: FomObject | FomArray
    export let object: Writable<any>
    export let showErrors = writable(false)
    export let errors: Readable<FomIssue[]>
    export let rootItemName = null as string | null

    function ensureComponentFinder() {
        if (!getContext('component.finder')) {
            setContext('component.finder', defaultComponentFinder)
        }
        if (!getContext('error.component.finder')) {
            setContext('error.component.finder', defaultErrorComponentFinder)
        }
    }

    ensureComponentFinder()

</script>

{#if schema.type === 'array'}
    <p>array</p>
    {#if rootItemName}
        {#if Array.isArray($object)}
            <ArrayContainerInner bind:value={$object} path={[]} field={schema} errors={$errors} showErrors={$showErrors}
                          itemName={rootItemName}/>
        {:else }
            <p class="text-error">Root type is an array, and the supplied object was of type {typeof $object}</p>
        {/if}
    {:else}
        <p class="text-error">No rootItemName supplied to root form, and root type is an array</p>
    {/if}
{:else}
    <p class="text-danger">To do ${schema.type}</p>
{/if}