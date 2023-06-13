<script lang="ts">
    import {
        attachmentPropertyConfigurationSchema,
        attachmentPropertyDataSchema,
        datePropertyConfigurationSchema,
        datePropertyDataSchema
    } from "$lib/cozembleSchemas";
    import {ObjectEditorWrapper} from "@cozemble/data-editor";
    import {writable} from "svelte/store";
    import {afterUpdate} from "svelte";
    import {clickOutside} from "@cozemble/ui-atoms";


    let configurationSchema = {}
    let dataSchema = {}

    function configurationSchemaChanged(event: Event) {
        const target = event.target as HTMLTextAreaElement
        try {
            configurationSchema = JSON.parse(target.value)
        } catch (e) {
            console.error(e)
        }
    }

    function dataSchemaChanged(event: Event) {
        const target = event.target as HTMLTextAreaElement
        try {
            dataSchema = JSON.parse(target.value)
        } catch (e) {
            console.error(e)
        }
    }

    function typeChanged(event: Event) {
        const target = event.target as HTMLSelectElement
        const type = target.value
        if (type === 'date') {
            configurationSchema = datePropertyConfigurationSchema
            dataSchema = datePropertyDataSchema
        }
        if (type === 'attachment') {
            configurationSchema = attachmentPropertyConfigurationSchema
            dataSchema = attachmentPropertyDataSchema
        }
        errors.set({})
    }

    const configuration = writable({})
    const errors = writable({})

    let showEditor = false

    function onShowEditor() {
        showEditor = true
    }


    afterUpdate(() => console.log({configuration: $configuration}))

</script>

<div class="flex">
    <select class="input input-bordered" on:change={typeChanged}>
        <option>-----</option>
        <option value="date">Date</option>
        <option value="attachment">Attachment</option>
    </select>

</div>
<div class="flex">
    <div class="flex flex-col w-50">
        <h4>Configuration schema</h4>
        <textarea cols="80" rows="20"
                  on:change={configurationSchemaChanged}>{JSON.stringify(configurationSchema, null, 2)}</textarea>
    </div>
    <div class="ml-3 flex flex-col">
        <h4>Data schema</h4>
        <textarea cols="80" rows="20" on:change={dataSchemaChanged}>{JSON.stringify(dataSchema, null, 2)}</textarea>
    </div>
</div>
<div class="flex  mt-3">
    <div class="w-1/4">
        <ObjectEditorWrapper
                schema={configurationSchema}
                title={'Configuration'}
                bind:value={$configuration}
                errors={$errors}/>
    </div>
    <div class="ml-4">
        <h2 class="font-bold text-xl text-primary capitalize">Data editor</h2>

        <table class="table mt-4    ">
            <thead>
            <tr>
                <th>Left</th>
                <th>Value</th>
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
                                    EDIT
                                </div>
                            {:else}
                                <div class="w-full h-full">
                                    VALUE
                                </div>
                            {/if}
                        </div>
                    </div>
                </td>
                <td class="border">Right</td>
            </tr>
            </tbody>
        </table>

    </div>
</div>