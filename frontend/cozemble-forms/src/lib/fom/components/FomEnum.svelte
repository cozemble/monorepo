<script lang="ts">
    import {getContext} from "svelte";
    import type {FomEnum} from "../Fom";
    import type {Path} from "./helper";
    import {componentFinder} from "./helper";

    export let key: string
    export let field: FomEnum
    export let value: any
    export let path: Path

    $: componentAndProps = componentFinder(getContext)(field, path)
    $: values = field.options
</script>

<svelte:component this={componentAndProps.component} {...componentAndProps.props} {key} bind:value={value} {values}/>
