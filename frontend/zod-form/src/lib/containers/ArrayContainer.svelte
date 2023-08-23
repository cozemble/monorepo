<script lang="ts">

    import InputLabel from "$lib/inputs/InputLabel.svelte";
    import {z, type ZodIssue} from "zod";
    import ArrayContainerInner from "$lib/containers/ArrayContainerInner.svelte";

    export let key: string
    export let value: any[]
    export let path: string[]
    export let field: z.ZodArray<any>
    export let errors: ZodIssue[] = []
    export let showErrors: boolean

</script>

<InputLabel {key}/>
{#if value}
    <ArrayContainerInner bind:value {path} {field} {errors} {showErrors} itemName={key}/>
{/if}