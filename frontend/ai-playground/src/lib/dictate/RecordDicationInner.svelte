<script lang="ts">
    import type {DataRecord} from "@cozemble/model-core";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import {eventSourcedRecordGraphStore} from "@cozemble/frontend-datatable";
    import VoiceToJson from "$lib/dictate/VoiceToJson.svelte";
    import {convertModelToJsonSchema} from "$lib/convertModelToJsonSchema";
    import {allModels, modelStore, systemConfiguration} from "$lib/generative/stores";
    import {writable} from "svelte/store";
    import {jsonToRecord, modelToJson} from "@cozemble/model-to-json";
    import {onDestroy} from "svelte";
    import DictatedRecordPreview from "$lib/dictate/DictatedRecordPreview.svelte";

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
            try {
                const fromJsonRecord = jsonToRecord($allModels, model.model, 'text-user', json)
                transcribedRecord = {...record, values: fromJsonRecord.values}
                eventSourcedRecordGraph.update(graph => ({
                    ...graph,
                    records: graph.records.map(esr => esr.record.id.value === transcribedRecord.id.value ? {
                        ...esr,
                        record: transcribedRecord
                    } : esr)
                }))
            } catch (e:any) {
                console.error('Failed to convert json to record', e)
            }
        }
        console.log('jsonObject', {json, transcribedRecord, graph: $eventSourcedRecordGraph})
    })

    onDestroy(() => {
        unsub()
    })
</script>

<p>This is the dictation page for record id {record.id.value} and model {model.model?.name?.value}</p>
<div>
    <VoiceToJson {schema} {jsonObject} {transcript}/>
</div>
<DictatedRecordPreview {model} record={transcribedRecord} {eventSourcedRecordGraph}/>