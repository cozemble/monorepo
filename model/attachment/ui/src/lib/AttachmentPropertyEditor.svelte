<script lang="ts">
    import type {DataRecord, DataRecordPath} from '@cozemble/model-core'
    import type {AttachmentList} from "@cozemble/model-attachment-core";
    import {dataRecordPathFns} from "@cozemble/model-api";

    export let recordPath: DataRecordPath
    export let record: DataRecord
    let error: string | null = null

    $: value = dataRecordPathFns.getValue(recordPath, record) as AttachmentList ?? null
</script>

<p>Upload an attachment</p>