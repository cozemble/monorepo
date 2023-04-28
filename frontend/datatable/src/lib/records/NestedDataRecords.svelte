<script lang="ts">
    import type {NestedRecordsContext} from "./RecordsContext";
    import DataRecordsTable from "./DataRecordsTable.svelte";
    import type {DataRecordsTableOptions} from "./DataRecordsTableOptions";

    export let nestedContext: NestedRecordsContext
    export let options: DataRecordsTableOptions
    const nestedModel = nestedContext.model()
    const oneOnly = nestedContext.nestedModel.cardinality === 'one'
</script>

<h6 class="mb-2">{nestedContext.nestedModel.name.value}</h6>
<DataRecordsTable context={nestedContext} {options} {oneOnly}/>
