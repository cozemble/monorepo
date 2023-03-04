<script lang="ts">
    import type {Model} from "@cozemble/model-core";
    import {loadInitialRecords} from "./loadInitialRecords";
    import {records} from "./recordsHost";
    import {onMount} from "svelte";
    import DataPanelInner from "./DataPanelInner.svelte";

    export let tenantId: string
    export let models: Model[]
    export let model: Model

    onMount(async () => {
        try {
            const {records: initialRecords} = await loadInitialRecords(tenantId, model.id.value)
            records.set(initialRecords.records)
        } catch (e) {
            console.error(e)
        }
    })

</script>

<DataPanelInner {models} {model} {tenantId} {records}/>
