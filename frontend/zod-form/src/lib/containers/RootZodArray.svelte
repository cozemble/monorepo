<script lang="ts">
    import {z, type ZodIssue} from "zod"
    import ArrayContainerInner from "$lib/containers/ArrayContainerInner.svelte";

    export let value: any[]
    export let schema: z.ZodArray<any>
    export let errors: ZodIssue[] = []
    export let showErrors: boolean
    export let itemName: string
</script>

<ArrayContainerInner bind:value path={[]} field={schema} {errors} {showErrors} {itemName}/>
