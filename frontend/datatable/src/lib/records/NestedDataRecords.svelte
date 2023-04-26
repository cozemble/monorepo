<script lang="ts">
    import type {RecordsContext} from "./RecordsContext";
    import DataRecordsTable from "./DataRecordsTable.svelte";

    export let nestedContext: RecordsContext
    const nestedModel = nestedContext.model
</script>

<h6 class="mb-2">{$nestedModel.model.name.value}</h6>
<DataRecordsTable context={nestedContext}/>
