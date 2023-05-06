<script lang="ts">
    import type {DataRecord, DataRecordValuePath, SystemConfiguration} from '@cozemble/model-core'
    import type {IntegerProperty} from "@cozemble/model-integer-core";
    import {propertyDescriptors} from "@cozemble/model-core/dist/esm";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration
    const property = recordPath.lastElement as IntegerProperty
    const propertyDescriptor = propertyDescriptors.mandatory(property)

    $: value = propertyDescriptor.getValue(systemConfiguration, property, record) ?? null
</script>

{#if value}
    {value}
{:else}
    &nbsp;
{/if}
