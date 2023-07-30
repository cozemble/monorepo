<script lang="ts">
    import {writable} from "svelte/store";
    import {modelRecordsContextFns} from "@cozemble/frontend-datatable";
    import {gettableWritable} from "@cozemble/frontend-datatable";
    import type {ErrorVisibilityByRecordId} from "@cozemble/frontend-datatable";
    import type {DataRecord} from "@cozemble/model-core";

    export let record: DataRecord

    modelRecordsContextFns.setPermitRecordAdditions(writable(false))
    const errorVisibility = new Map() as ErrorVisibilityByRecordId
    errorVisibility.set(record.id.value, true)
    const errorVisibilityByRecordId = gettableWritable(errorVisibility)

    modelRecordsContextFns.setErrorVisibilityByRecordId(errorVisibilityByRecordId)

</script>
<slot></slot>