<script lang="ts">
    import type {RecordsContext} from "./RecordsContext";
    import DataRecordsTable from "./DataRecordsTable.svelte";
    import type {SystemConfiguration} from "@cozemble/model-core";

    export let nestedContext: RecordsContext
    export let systemConfiguration:SystemConfiguration
    const nestedModel = nestedContext.model
</script>

<h6 class="mb-2">{$nestedModel.model.name.value}</h6>
<DataRecordsTable context={nestedContext} {systemConfiguration}/>
