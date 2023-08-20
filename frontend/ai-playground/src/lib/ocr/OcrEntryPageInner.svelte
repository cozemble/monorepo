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
    import {safeConvertJsonToRecord} from "$lib/dictate/safeConvertJsonToRecord";
    import OcrActivity from "$lib/ocr/OcrActivity.svelte";
    import type {TranscribedImage} from "$lib/dictate/whisper/TranscribedAudio";
    import {convertTextToJson} from "$lib/dictate/convertTextToJson";
    import {convertHtmlToJson} from "$lib/ocr/convertHtmlToJson";

    export let record: DataRecord
    export let model: EventSourcedModel
    let transcribedRecord = {...record}
    let file: File | null = null
    let errorMessage = null as string | null
    let transcription = null as TranscribedImage | null

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

    function init(element: HTMLInputElement) {
        element.focus()
    }

    async function upload() {
        if (!file) {
            return;
        }
        transcription = {_type: 'transcribed.image', image: file[0], transcription: null}
    }

    function docTranscribed(event:CustomEvent) {
        console.log({event, transcription})
        handleHtml()
    }

    async function handleHtml() {
        const html = transcription?.transcription ?? ''
        console.log({html})
        if (html.trim().length === 0) {
            jsonObject.set(null)
        } else {
            convertHtmlToJson(schema, html).then(json => {
                jsonObject.set(JSON.parse(json.result))
            })
        }
    }

</script>

<div class="mb-2 mt-2">
    {#if transcription === null}
        <input type="file" class="input input-bordered pt-2" bind:files={file} use:init/>
        <button class="btn btn-primary ml-2" on:click={upload}>
            Upload
        </button>
    {:else}
        <OcrActivity image={transcription} on:transcribed={docTranscribed}/>
    {/if}
</div>
<DictatedRecordPreview {model} record={transcribedRecord} {eventSourcedRecordGraph}/>