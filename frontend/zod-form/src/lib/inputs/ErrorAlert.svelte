<script lang="ts">
    import type { ZodIssue } from "zod"
    import { afterUpdate } from "svelte"

    export let showErrors: boolean
    export let errors: ZodIssue[]

    afterUpdate(() => console.log({showErrors, errors}))
</script>
{#if showErrors && errors.length > 0}
    <p class="text-error">{errors[0].message}</p>
{/if}