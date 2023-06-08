<script lang="ts">
    import type {StringProperty} from "@cozemble/model-string-core";

    export let value: string
    export let property: StringProperty

</script>

{#if value}
    {#if property.multiline}
        {@html value.replace(/\n/g, '<br>') }
    {:else}
        {value}
    {/if}
{:else}
    &nbsp;
{/if}
