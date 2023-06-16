<script lang="ts">

    export let value: any | null

    $: displayable = value ?? ''
</script>

{#if value}
    {value}
{:else}
    &nbsp;
{/if}
