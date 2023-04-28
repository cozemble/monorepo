<script lang="ts">
    import type {RecordsContext} from "./RecordsContext";
    import DataRecordsTable from "./DataRecordsTable.svelte";
    import type {DataRecordsTableOptions} from "./DataRecordsTableOptions";

    export let nestedContext: RecordsContext
    export let options:DataRecordsTableOptions
    const nestedModel = nestedContext.model
    const oneOnly = nestedContext.cardinality === 'one'
</script>

<h6 class="mb-2">{$nestedModel.model.name.value}</h6>
<DataRecordsTable context={nestedContext} {options} {oneOnly}/>
