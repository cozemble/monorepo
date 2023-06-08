<script lang="ts">
    import type {DataRecord, DataRecordValuePath, SystemConfiguration} from '@cozemble/model-core'
    import {propertyDescriptors} from "@cozemble/model-core";
    import type {DecimalProperty} from "@cozemble/model-decimal-core";
    import DecimalPropertyViewer from "$lib/DecimalPropertyViewer.svelte";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration

    const property = recordPath.lastElement as DecimalProperty
    const propertyDescriptor = propertyDescriptors.mandatory(property)

    $: value = propertyDescriptor.getValue(systemConfiguration, property, record) ?? null
</script>

<DecimalPropertyViewer {value}/>