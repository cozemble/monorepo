<script lang="ts">
    import {z} from 'zod'
    import type {Path} from './helper'
    import {componentFinder} from "./helper";
    import {getContext} from "svelte";

    export let key: string
    export let field: z.ZodEnum<any>
    export let value: any
    export let path: Path

    $: componentAndProps = componentFinder(getContext)(field, path)
    $: values = field._def.values
</script>

<svelte:component this={componentAndProps.component} {...componentAndProps.props} {key} bind:value={value} {values}/>
