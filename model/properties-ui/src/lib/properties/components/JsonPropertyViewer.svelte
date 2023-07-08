<script lang="ts">

    export let value: any | null

</script>

{#if value}
    {value}
{:else}
    &nbsp;
{/if}
