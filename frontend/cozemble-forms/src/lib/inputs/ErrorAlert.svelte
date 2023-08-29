<script lang="ts">
    import type {FomIssue} from "..";

    export let showErrors: boolean
    export let errors: FomIssue[]

</script>
{#if showErrors && errors.length > 0}
    <p class="text-error">{errors[0].message}</p>
{/if}