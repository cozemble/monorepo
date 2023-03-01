<script lang="ts">
    import type {PageData} from './$types'
    import {page} from '$app/stores';
    import DataPanelInner from "../../../../../lib/data/DataPanelInner.svelte";
    import type {DataRecord, Model} from "@cozemble/model-core";
    import {
        registerAllProperties,
        registerAllPropertyEditors,
        registerAllPropertyViewers
    } from "@cozemble/model-assembled";
    import {onMount} from "svelte";
    import {writable, type Writable} from "svelte/store";
    import type {BackendModel} from "@cozemble/backend-tenanted-api-types";

    export let data: PageData
    const records: Writable<DataRecord[]> = writable([])

    $:count = data.records?.records?.count ?? 0
    $:totalPages = data.records?.records?.totalPages ?? 0
    $:models = (data.tenant?.models ?? []).map((m: BackendModel) => m.definition) as Model[]
    $:model = models.find(m => m.id.value === $page.params.modelId)

    let mounted = false
    onMount(() => {
        records.set(data.records?.records ?? [])
        registerAllProperties()
        registerAllPropertyViewers()
        registerAllPropertyEditors()
        mounted = true
    })

</script>

{#if model && mounted}
    <DataPanelInner {models} {model} {records} tenantId={$page.params.tenantId}/>
{/if}