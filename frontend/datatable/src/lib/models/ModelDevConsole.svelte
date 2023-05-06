<script lang="ts">

    import {modelRecordsContextFns} from "../records/modelRecordsContextFns";
    import {writable} from "svelte/store";
    import ModelDevConsoleOption from "./ModelDevConsoleOption.svelte";

    const eventSourcedModel = modelRecordsContextFns.getEventSourcedModel()
    const model = modelRecordsContextFns.getModel()
    const records = modelRecordsContextFns.getRecords()
    const eventSourcedRecords = modelRecordsContextFns.getEventSourcedRecords()
    const filterParams = modelRecordsContextFns.getFilterParams()
    const focus = modelRecordsContextFns.getFocus()
    const tab = writable("model" as string)
</script>

<div class="border border-base-300 mb-2">
</div>
<h6>Dev console</h6>
<div class="tabs">
    <ModelDevConsoleOption id="model" label="Model" {tab}/>
    <ModelDevConsoleOption id="eventSourcedModel" label="Event sourced model" {tab}/>
    <ModelDevConsoleOption id="records" label="Records" {tab}/>
    <ModelDevConsoleOption id="eventSourcedRecords" label="Event sourced records" {tab}/>
    <ModelDevConsoleOption id="filterParams" label="Filter params" {tab}/>
    <ModelDevConsoleOption id="focus" label="Focus" {tab}/>
</div>
<div class="text-xs">
    {#if $tab === 'model'}
        <pre>{JSON.stringify($model, null, 2)}</pre>
    {/if}
    {#if $tab === 'eventSourcedModel'}
        <pre>{JSON.stringify($eventSourcedModel, null, 2)}</pre>
    {/if}
    {#if $tab === 'records'}
        <pre>{JSON.stringify($records, null, 2)}</pre>
    {/if}
    {#if $tab === 'eventSourcedRecords'}
        <pre>{JSON.stringify($eventSourcedRecords, null, 2)}</pre>
    {/if}
    {#if $tab === 'filterParams'}
        <pre>{JSON.stringify($filterParams, null, 2)}</pre>
    {/if}
    {#if $tab === 'focus'}
        <pre>{JSON.stringify($focus, null, 2)}</pre>
    {/if}
</div>