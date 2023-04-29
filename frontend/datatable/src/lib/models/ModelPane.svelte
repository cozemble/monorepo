<script lang="ts">
    import {allEventSourcedModels, allModels} from "../stores/allModels";
    import {mandatory} from "@cozemble/lang-util";
    import {defaultOnError, rootRecordsContext} from "../appBackend";
    import {modelIdFns} from "@cozemble/model-api";
    import {onMount} from "svelte";
    import DataRecordsTable from "../records/DataRecordsTable.svelte";
    import type {SystemConfiguration} from "@cozemble/model-core";

    export let modelId: string
    export let systemConfiguration: SystemConfiguration
    const model = mandatory($allModels.find(model => model.id.value === modelId), `Model with id ${modelId} not found`)
    const context = rootRecordsContext(defaultOnError,allEventSourcedModels, modelIdFns.newInstance(modelId))

    onMount(async () => {
        await context.loadRecords()
    })
</script>
<div class="mt-3">
    <DataRecordsTable {context}/>
</div>