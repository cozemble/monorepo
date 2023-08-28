<script lang="ts">
    import {getContext, afterUpdate} from 'svelte'
    import type {FomArray, FomIssue} from "../Fom";
    import {componentFinder, type Path} from "./helper";

    export let key: string
    export let field: FomArray
    export let value: any
    export let path: Path
    export let errors: FomIssue[]
    export let showErrors: boolean

    $: componentAndProps = componentFinder(getContext)(field, path)

    if (value[key] === undefined) {
        value[key] = []
    }

    afterUpdate(() => console.log({value}))
</script>

{#if value[key] !== undefined}
    {#if Array.isArray(value[key])}
        <svelte:component this={componentAndProps.component} {...componentAndProps.props} {key} bind:value={value[key]}
                          {path} {field} {errors} {showErrors}/>
    {:else}
        <p class="text-error">Value is not an array</p>
    {/if}
    {:else}
    <p class="text-error">Value[key] is undefined</p>
{/if}
