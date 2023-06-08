<script lang="ts">
    export let value: any
</script>

{#if value}
    {value}
{:else}
    &nbsp;
{/if}
