<script lang="ts">
    import type {DataRecord, Property} from "@cozemble/model-core";

    export let property: Property
    export let record: DataRecord

    $:value = property.getValue(record)
</script>
{#if value}
    {value}
{/if}