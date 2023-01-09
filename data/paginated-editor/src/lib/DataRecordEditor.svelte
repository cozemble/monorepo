<script lang="ts">
    import type {DataRecord, DataRecordPath, Model} from "@cozemble/model-core";
    import DataRecordEditorInner from "$lib/DataRecordEditorInner.svelte";
    import {dataRecordFns} from "@cozemble/model-api";

    export let models: Model[]
    export let model: Model
    export let record: DataRecord
    export let errors: Map<DataRecordPath, string[]>
    export let focus: DataRecordPath | null
</script>

<h2>Edit {model.name.value}</h2>

<DataRecordEditorInner {models} {model} record={dataRecordFns.fullStructure(models, record)} parentPath={[]} {errors}
                       {focus}/>
