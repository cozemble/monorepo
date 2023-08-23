<script lang="ts">
    import {z} from 'zod'
    import {getContext} from 'svelte'
    import {componentFinder} from "./helper";

    export let key: string
    export let field: z.ZodString
    export let value: any
    export let path: string[]

    $: componentAndProps = componentFinder(getContext)(field, path)
</script>

<svelte:component this={componentAndProps.component} {...componentAndProps.props} {key} bind:value={value}/>
