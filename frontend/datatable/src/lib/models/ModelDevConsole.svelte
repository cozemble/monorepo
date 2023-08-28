<script lang="ts">
    import {writable} from 'svelte/store'

    import {modelRecordsContextFns} from '../records/modelRecordsContextFns'
    import ModelDevConsoleOption from './ModelDevConsoleOption.svelte'
    import {allEventSourcedModels, allModels} from "$lib/stores/allModels";
    import {backend} from "$lib/appBackend";

    const eventSourcedModel = modelRecordsContextFns.getEventSourcedModel()
    const model = modelRecordsContextFns.getModel()
    const records = modelRecordsContextFns.getRecords()
    const eventSourcedRecords = modelRecordsContextFns.getEventSourcedRecordGraph()
    const filterParams = modelRecordsContextFns.getFilterParams()
    const focus = modelRecordsContextFns.getFocus()
    const subgraphs = modelRecordsContextFns.getSubGraphCollectorsByRecordId()
    const tab = writable('model' as string)

    $: json =
        $tab === 'models'
            ? $allModels
            :$tab === 'model'
            ? $model
            : $tab === 'eventSourcedModel'
                ? $eventSourcedModel
            : $tab === 'eventSourcedModels'
                ? $allEventSourcedModels
                : $tab === 'records'
                    ? $records
                    : $tab === 'eventSourcedRecords'
                        ? $eventSourcedRecords
                        : $tab === 'filterParams'
                            ? $filterParams
                            : $tab === 'focus'
                                ? $focus :
                                    $tab === 'backend'
                                        ? backend:
                                    $tab === 'subGraphs'
                                        ? subgraphs
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
    <ModelDevConsoleOption
            id="eventSourcedModels"
            label="Event sourced models"
            {tab}
    />
    <ModelDevConsoleOption id="records" label="Records" {tab}/>
    <ModelDevConsoleOption
            id="eventSourcedRecords"
            label="Event sourced record graph"
            {tab}
    />
    <ModelDevConsoleOption id="filterParams" label="Filter params" {tab}/>
    <ModelDevConsoleOption id="focus" label="Focus" {tab}/>
    <ModelDevConsoleOption id="backend" label="Backend" {tab}/>
    <ModelDevConsoleOption id="subGraphs" label="Sub graphs" {tab}/>
</div>
