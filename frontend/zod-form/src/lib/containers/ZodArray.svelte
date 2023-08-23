<script lang="ts">
    import {z, type ZodIssue} from 'zod'
    import {getContext, onMount} from 'svelte'
    import {componentFinder} from "./helper";
    import type {Path} from "./helper";

    export let key: string
    export let field: z.ZodArray<any>
    export let value: any
    export let path: Path
    export let errors: ZodIssue[] = []
    export let showErrors: boolean

    let mounted = false

    $: componentAndProps = componentFinder(getContext)(field, path)

    function ensureArray() {
        if (value[key] === undefined) {
            value[key] = []
        }
    }

    onMount(() => {
        ensureArray()
        mounted = true
    })

</script>

{#if mounted}
    <svelte:component this={componentAndProps.component} {...componentAndProps.props} {key} bind:value={value[key]} {path} {field} {errors} {showErrors}/>
{/if}
