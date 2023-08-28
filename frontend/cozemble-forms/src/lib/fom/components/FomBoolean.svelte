<script lang="ts">
    import {getContext} from 'svelte'
    import type {FomBoolean} from "../Fom";
    import {componentFinder, type Path} from "./helper";

    export let key: string
    export let field: FomBoolean
    export let value: boolean
    export let path: Path

    $: componentAndProps = componentFinder(getContext)(field, path)
</script>

<svelte:component this={componentAndProps.component} {...componentAndProps.props} {key} bind:value={value}/>
