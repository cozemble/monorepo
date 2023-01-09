<script lang="ts">
    import {createEventDispatcher, onMount} from 'svelte';
    import type {DataRecord, DataRecordPath, Model} from "@cozemble/model-core";
    import DataRecordEditor from "$lib/DataRecordEditor.svelte";
    import type {DataRecordEditEvent, DataRecordEditorClient} from "@cozemble/model-editor-sdk";
    import {dataRecordEditorHost} from "@cozemble/model-editor-sdk";
    import {dataRecordPathFns, modelFns} from "@cozemble/model-api";
    import {applyValueChangedToRecord} from "$lib/onValueChanged";
    import {type Writable, writable} from "svelte/store";
    import {applyValueChangedToFocus} from "$lib/applyValueChangedToFocus";

    export let models: Model[]
    export let model: Model
    export let record: DataRecord
    export let focus: Writable<DataRecordPath | null> = writable(null)
    let errors: Map<DataRecordPath, string[]> = new Map()

    const dispatch = createEventDispatcher();

    function handleCancel() {
        dispatch("cancel")
    }

    function handleSave() {
    }

    const dataRecordEditorClient: DataRecordEditorClient = {
        dispatchEditEvent(event: DataRecordEditEvent): void {
            if (event._type === "data.record.value.changed") {
                record = applyValueChangedToRecord(models,record, event)
                if($focus) {
                    $focus = applyValueChangedToFocus($focus, models, record,event)
                }
                errors = modelFns.validate(models, record)
            } else if (event._type === "data.record.edit.aborted") {
                console.log({event})
            }
        },
    }
    dataRecordEditorHost.setClient(dataRecordEditorClient)

    onMount(() => {
        focus.set(dataRecordPathFns.newInstance(model.properties[0]))
    })
</script>

<DataRecordEditor {models} {model} {record} {errors} focus={$focus}/>

<div class="buttons">
    <button type="button" on:click={handleSave}>Save</button>
    <button type="button" on:click={handleCancel}>Cancel</button>
</div>

<style>
    .buttons {
        margin-top: 1rem;
    }
</style>