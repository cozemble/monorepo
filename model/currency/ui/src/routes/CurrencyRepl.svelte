<script lang="ts">
    import type {DataRecord, DataRecordValuePath, Model, ModelEvent} from "@cozemble/model-core";
    import {systemConfigurationFns} from "@cozemble/model-core";
    import type {CurrencyProperty} from "@cozemble/model-currency-core";
    import CurrencyPropertyConfigurer from "$lib/CurrencyPropertyConfigurer.svelte";
    import CurrencyPropertyEditor from "$lib/CurrencyPropertyEditor.svelte";
    import CurrencyPropertyViewer from "$lib/CurrencyPropertyViewerWrapper.svelte";

    export let model: Model
    export let property: CurrencyProperty
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
    <div class="text-2xl font-bold ">Integer Property Configurer</div>
    <CurrencyPropertyConfigurer {model} {property} on:modelChanged/>

    <div class="text-2xl font-bold mt-4">Integer Value Editor</div>
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
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div class="flex w-full h-full " on:click={onShowEditor}>
                    <div>
                        {#if showEditor}
                            <div>
                                <CurrencyPropertyEditor {record} {recordPath} {systemConfiguration}/>
                            </div>
                        {:else}
                            <div class="w-full h-full">
                                <CurrencyPropertyViewer {record} {recordPath} {systemConfiguration}/>
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
            <div class="text-2xl font-bold mt-4">Integer Property JSON</div>
            <pre>{JSON.stringify(property, null, 2)}</pre>
        </div>
        <div class="ml-4">
            <div class="text-2xl font-bold mt-4">Model events</div>
            <pre>{JSON.stringify(modelEvents, null, 2)}</pre>
        </div>
    </div>
</div>