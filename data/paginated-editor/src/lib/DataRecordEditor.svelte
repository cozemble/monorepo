<script lang="ts">
    import type {DataRecord, DataRecordPath, Model} from "@cozemble/model-core";
    import DataRecordEditorInner from "$lib/DataRecordEditorInner.svelte";
    import {dataRecordFns} from "@cozemble/model-api";
    import type {DataRecordPathFocus} from "$lib/DataRecordPathFocus";
    import type {Writable} from 'svelte/store';

    export let models: Model[]
    export let model: Model
    export let record: DataRecord
    export let errors: Map<DataRecordPath, string[]>
    export let focus: Writable<DataRecordPathFocus>
    export let title: string

</script>

<h2>{title}</h2>

<DataRecordEditorInner {models} {model} record={dataRecordFns.fullStructure(models, record)} parentPath={[]} {errors}
                       {focus}/>
