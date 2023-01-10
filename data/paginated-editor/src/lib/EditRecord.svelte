<script lang="ts">
    import {afterUpdate, createEventDispatcher} from 'svelte';
    import type {DataRecord, DataRecordPath, Model} from "@cozemble/model-core";
    import DataRecordEditor from "$lib/DataRecordEditor.svelte";
    import type {DataRecordEditEvent, DataRecordEditorClient} from "@cozemble/model-editor-sdk";
    import {dataRecordEditorHost} from "@cozemble/model-editor-sdk";
    import {modelFns} from "@cozemble/model-api";
    import {applyValueChangedToRecord} from "$lib/onValueChanged";
    import {type Writable, writable} from "svelte/store";
    import {DataRecordPathFocus} from "./DataRecordPathFocus";

    export let models: Model[]
    export let model: Model
    export let record: DataRecord
    export let focus: Writable<DataRecordPathFocus> = writable(new DataRecordPathFocus(models, () => record).setInitial(model))
    export let title: string
    let errors: Map<DataRecordPath, string[]> = new Map()

    const dispatch = createEventDispatcher()

    function handleCancel() {
        dispatch("cancel")
    }

    function handleSave() {
        errors = modelFns.validate(models, record)
        if (errors.size > 0) {
            return
        }
        dispatch("save", {record})
    }

    const dataRecordEditorClient: DataRecordEditorClient = {
        dispatchEditEvent(event: DataRecordEditEvent): void {
            if (event._type === "data.record.value.changed") {
                record = applyValueChangedToRecord(models, record, event)
                console.log({mutatedRecord: record, event})
                $focus = $focus.applyValueChangedToFocus(event)
                errors = modelFns.validate(models, record)
            } else if (event._type === "data.record.edit.aborted") {
                console.log({event})
            }
        },
    }
    dataRecordEditorHost.setClient(dataRecordEditorClient)


    afterUpdate(() => console.log({models, record, errors, focus: $focus}))
</script>

<DataRecordEditor {models} {model} {record} {errors} {focus} {title}/>

<div class="buttons">
    <button type="button" class="save" on:click={handleSave}>Save</button>
    <button type="button" class="cancel" on:click={handleCancel}>Cancel</button>
</div>

<style>
    .buttons {
        margin-top: 1rem;
    }
</style>