<script lang="ts">
    import {editorExtensions} from "@cozemble/frontend-datatable";
    import type {DataRecord, DataRecordId} from "@cozemble/model-core";
    import type {Readable} from "svelte/store";
    import {derived} from "svelte/store";
    import {modelStore} from "$lib/generative/stores";
    import {objects} from "@cozemble/lang-util";
    import WhisperDictationInner from "./WhisperDictationInner.svelte";

    export let rootRecordId: DataRecordId
    export let records: Readable<DataRecord[]>
    const modelPaneSwitch = editorExtensions.getSwitchableModelPane()
    const record = derived(records, rs => rs.find(r => r.id.value === rootRecordId.value))
    const model = derived(record, r => r ? $modelStore.models.find(m => m.model.id.value === r.modelId.value) : null)

    function close() {
        modelPaneSwitch.set(null)
    }
</script>
{#if $record && $model}
    <WhisperDictationInner record={objects.castValue($record)} model={objects.castValue($model)}/>
{:else}
    <p>Record not found</p>
{/if}
<button class="btn btn-primary" on:click={close}>Close</button>