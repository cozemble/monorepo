<script lang="ts">
    import {writable} from 'svelte/store'
    import {JSONEditor} from 'svelte-jsoneditor'

    import {modelRecordsContextFns} from '../records/modelRecordsContextFns'
    import ModelDevConsoleOption from './ModelDevConsoleOption.svelte'
    import {allModels} from "$lib/stores/allModels";

    const eventSourcedModel = modelRecordsContextFns.getEventSourcedModel()
    const model = modelRecordsContextFns.getModel()
    const records = modelRecordsContextFns.getRecords()
    const eventSourcedRecords = modelRecordsContextFns.getEventSourcedRecords()
    const filterParams = modelRecordsContextFns.getFilterParams()
    const focus = modelRecordsContextFns.getFocus()
    const tab = writable('model' as string)

    $: json =
        $tab === 'models'
            ? $allModels
            :$tab === 'model'
            ? $model
            : $tab === 'eventSourcedModel'
                ? $eventSourcedModel
                : $tab === 'records'
                    ? $records
                    : $tab === 'eventSourcedRecords'
                        ? $eventSourcedRecords
                        : $tab === 'filterParams'
                            ? $filterParams
                            : $tab === 'focus'
                                ? $focus
                                : null

    $: content = {
        json,
        text:""
    }
</script>

<div class="border border-base-300 mb-2"/>
<h6>Dev console</h6>
<div class="tabs">
    <ModelDevConsoleOption id="model" label="Model" {tab}/>
    <ModelDevConsoleOption id="models" label="Models" {tab}/>
    <ModelDevConsoleOption
            id="eventSourcedModel"
            label="Event sourced model"
            {tab}
    />
    <ModelDevConsoleOption id="records" label="Records" {tab}/>
    <ModelDevConsoleOption
            id="eventSourcedRecords"
            label="Event sourced records"
            {tab}
    />
    <ModelDevConsoleOption id="filterParams" label="Filter params" {tab}/>
    <ModelDevConsoleOption id="focus" label="Focus" {tab}/>
</div>
<div class="text-xs">
    <JSONEditor {content}/>
</div>
