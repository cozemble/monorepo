<script lang="ts">
    import type {DataRecord, DataRecordValuePath, SystemConfiguration} from '@cozemble/model-core'
    import type {CurrencyProperty} from "@cozemble/model-currency-core";
    import {propertyDescriptors} from "@cozemble/model-core";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration
    const property = recordPath.lastElement as CurrencyProperty
    const propertyDescriptor = propertyDescriptors.mandatory(property)

    $: value = propertyDescriptor.getValue(systemConfiguration, property, record) ?? null
</script>

{#if value}
    {value}
{:else}
    &nbsp;
{/if}
