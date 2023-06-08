<script lang="ts">
    import type {DataRecord, DataRecordValuePath, Model, ModelEvent} from "@cozemble/model-core";
    import {propertyDescriptors, systemConfigurationFns} from "@cozemble/model-core";
    import type {IntegerProperty} from "@cozemble/model-integer-core";
    import IntegerPropertyConfigurer from "$lib/IntegerPropertyConfigurer.svelte";
    import IntegerPropertyEditor from "$lib/IntegerPropertyEditor.svelte";
    import IntegerPropertyViewer from "$lib/IntegerPropertyViewerWrapper.svelte";
    import {dataRecordEditor} from "@cozemble/data-editor-sdk";
    import {dataRecordEditEvents} from "@cozemble/model-event-sourced";

    export let model: Model
    export let property: IntegerProperty
    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let modelEvents: ModelEvent[]
    const systemConfiguration = systemConfigurationFns.empty()
    const propertyDescriptor = propertyDescriptors.mandatory(property)
    const dataRecordEditorClient = dataRecordEditor.getClient()


    let showEditor = false

    function onShowEditor() {
        showEditor = true
    }

    $: value = propertyDescriptor.getValue(systemConfiguration, property, record) ?? null

    function changeHandler(newValue: number | null, submitEvent: KeyboardEvent | null) {
        if (newValue !== value) {
            dataRecordEditorClient.dispatchEditEvent(
                dataRecordEditEvents.valueChanged(
                    record,
                    recordPath,
                    value,
                    newValue,
                    null,
                ),
            )
        }
    }


</script>

<div class="m-4">
    <div class="text-2xl font-bold ">Integer Property Configurer</div>
    <IntegerPropertyConfigurer {model} {property} on:modelChanged/>

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
                <div class="flex w-full h-full " on:click={onShowEditor}>
                    <div>
                        {#if showEditor}
                            <div>
                                <IntegerPropertyEditor {value} {property} {changeHandler}/>
                            </div>
                        {:else}
                            <div class="w-full h-full">
                                <IntegerPropertyViewer {record} {recordPath} {systemConfiguration}/>
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