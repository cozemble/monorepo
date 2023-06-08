<script lang="ts">
    import type {DataRecord, DataRecordValuePath, Model, ModelEvent} from "@cozemble/model-core";
    import {systemConfigurationFns} from "@cozemble/model-core";
    import type {DecimalProperty} from "@cozemble/model-decimal-core";
    import DecimalPropertyViewer from "$lib/DecimalPropertyViewerWrapper.svelte";
    import DecimalPropertyEditor from "../lib/DecimalPropertyEditor.svelte";
    import DecimalPropertyConfigurer from "../lib/DecimalPropertyConfigurer.svelte";

    export let model: Model
    export let property: DecimalProperty
    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let modelEvents: ModelEvent[]
    const systemConfiguration = systemConfigurationFns.empty()

    let showEditor = false

    function onShowEditor() {
        showEditor = true
    }

</script>

<div class="m-4">
    <div class="text-2xl font-bold ">Decimal Property Configurer</div>
    <DecimalPropertyConfigurer {model} {property} on:modelChanged/>

    <div class="text-2xl font-bold mt-4">Decimal Value Editor</div>
    <table class="table">
        <thead>
        <tr>
            <th>Left</th>
            <th>{property.name.value}</th>
            <th>Right</th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td class="border">Left</td>
            <td class="border">
                <div class="flex w-full h-full " on:click={onShowEditor}>
                    <div>
                        {#if showEditor}
                            <div>
                                <DecimalPropertyEditor {record} {recordPath} {systemConfiguration}/>
                            </div>
                        {:else}
                            <div class="w-full h-full">
                                <DecimalPropertyViewer {record} {recordPath} {systemConfiguration}/>
                            </div>
                        {/if}
                    </div>
                </div>
            </td>
            <td class="border">Right</td>
        </tr>
        </tbody>
    </table>
    <div class="flex">
        <div>
            <div class="text-2xl font-bold mt-4">Decimal Property JSON</div>
            <pre>{JSON.stringify(property, null, 2)}</pre>
        </div>
        <div class="ml-4">
            <div class="text-2xl font-bold mt-4">Model events</div>
            <pre>{JSON.stringify(modelEvents, null, 2)}</pre>
        </div>
    </div>
</div>