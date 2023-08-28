<script lang="ts">
    import {getContext} from 'svelte'
    import type {FomText} from "../Fom";
    import {componentFinder, type Path} from "./helper";

    export let key: string
    export let field: FomText
    export let value: any
    export let path: Path

    $: componentAndProps = componentFinder(getContext)(field, path)
</script>

<svelte:component this={componentAndProps.component} {...componentAndProps.props} {key} bind:value={value}/>
