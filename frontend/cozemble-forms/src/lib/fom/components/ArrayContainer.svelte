<script lang="ts">

    import InputLabel from "../../inputs/InputLabel.svelte";
    import type {FomArray, FomIssue} from "../Fom";
    import ArrayContainerInner from "./ArrayContainerInner.svelte";

    export let key: string
    export let value: any[]
    export let path: string[]
    export let field: FomArray
    export let errors: FomIssue[]
    export let showErrors: boolean

</script>

<InputLabel {key}/>
{#if value}
    <ArrayContainerInner bind:value {path} {field} {errors} {showErrors} itemName={key}/>
{/if}