<script lang="ts">
    import type {DataRecord} from "@cozemble/model-core";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import {eventSourcedRecordGraphStore} from "@cozemble/frontend-datatable";
    import {convertModelToJsonSchema} from "$lib/convertModelToJsonSchema";
    import {allModels, modelStore, systemConfiguration} from "$lib/generative/stores";
    import {writable} from "svelte/store";
    import {modelToJson} from "@cozemble/model-to-json";
    import {onDestroy} from "svelte";
    import DictatedRecordPreview from "$lib/dictate/DictatedRecordPreview.svelte";
    import WhisperVoiceToJson from "./WhisperVoiceToJson.svelte";
    import {safeConvertJsonToRecord} from "../safeConvertJsonToRecord";

    export let record: DataRecord
    export let model: EventSourcedModel
    const transcript = writable('')
    let transcribedRecord = {...record}
    const eventSourcedRecordGraph = eventSourcedRecordGraphStore(() => $systemConfiguration, () => $allModels, () => model.model, 'test-user')

    const schema = convertModelToJsonSchema(model.model, $modelStore.models.map(m => m.model))
    const initialJson = modelToJson($allModels, record)
    const jsonObject = writable(initialJson)

    const unsub = jsonObject.subscribe(json => {
        if (json) {
            const converted = safeConvertJsonToRecord($systemConfiguration, $allModels, model.model, json)
            if (converted) {
                transcribedRecord = {...record, values: converted.values}
                eventSourcedRecordGraph.update(graph => ({
                    ...graph,
                    records: graph.records.map(esr => esr.record.id.value === transcribedRecord.id.value ? {
                        ...esr,
                        record: transcribedRecord
                    } : esr)
                }))

            }
        }
        console.log('jsonObject', {json, transcribedRecord, graph: $eventSourcedRecordGraph})
    })

    onDestroy(() => {
        unsub()
    })
</script>

<div class="mb-2">
    <WhisperVoiceToJson {schema} {jsonObject} {transcript}/>
</div>
<DictatedRecordPreview {model} record={transcribedRecord} {eventSourcedRecordGraph}/>