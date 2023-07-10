<script lang="ts">
    import type {JsonArrayProperty} from "@cozemble/model-properties-core";
    import {jsonArrayPropertyDescriptor} from "@cozemble/model-properties-core";
    import {slotEditorRegistry} from "@cozemble/model-registries";
    import {makeArrayItemProperty} from "./makeArrayItemProperty";
    import {mandatory} from "@cozemble/lang-util";
    import {propertyDescriptors, systemConfigurationFns} from "@cozemble/model-core";
    import MaybeError from "$lib/properties/array/MaybeError.svelte";
    import type {ChangeHandler} from "$lib";

    export let property: JsonArrayProperty
    export let value: any[] | null
    export let changeHandler: ChangeHandler<any[]>
    export let closeHandler: () => void
    const systemConfiguration = systemConfigurationFns.empty() // this needs to tbe the real one, how to get it here?
    let valueChanged = false

    $: itemType = property?.configuration?.itemType
    $: pd = mandatory(
        propertyDescriptors.get(itemType),
        `No property descriptor registered for property type ${itemType}`,
    )
    $: editor = property?.configuration?.itemType ? slotEditorRegistry.forPropertyType(pd.propertyType) : null
    $: arrayItemProperty = makeArrayItemProperty(pd)
    $: errors = (value ?? []).map(v => pd.validateValue(systemConfiguration, arrayItemProperty, v))

    function addItem() {
        if (!value) {
            value = []
        }

        value = [...value, jsonArrayPropertyDescriptor.emptyArrayItem(arrayItemProperty.jsonType)]
        valueChanged = true
    }

    function makeChangeHandler(index: number) {
        return (changedValue: any) => {
            value = (value ?? []).map((v, i) => i === index ? changedValue : v)
            valueChanged = true
        }
    }

    function makeCloseHandler(_index: number) {
        return () => {
        }
    }

    function save() {
        changeHandler(value, {
                _type: 'editing.control.event',
                type: 'editingFinished'
            }
        )
        valueChanged = false
    }

    function cancel() {
        closeHandler()
    }

    function deleteItem(index: number) {
        value = (value ?? []).filter((v, i) => i !== index)
        valueChanged = true
    }
</script>


{#if editor}
    <div class="editor-outer p-4 bg-base-100 rounded border border-base-300">
        {#if value}
            {#each value as v, index}
                <div class="edit-container index-{index} border border-base-300 mb-2">
                    <div class="flex">
                        <svelte:component this={editor} property={arrayItemProperty} value={v}
                                          changeHandler={makeChangeHandler(index)}
                                          closeHandler={makeCloseHandler(index)}/>
                        <button class="btn btn-secondary btn-xs delete-item ml-2" on:click={() => deleteItem(index)}>
                            Delete
                        </button>
                    </div>
                    <MaybeError errors={errors[index]}/>
                </div>
            {/each}
        {/if}

        <button class="btn btn-primary btn-xs add-item" on:click={addItem}>Add item</button>
        {#if valueChanged}
            <button class="btn btn-secondary btn-xs save-item" on:click={save}>Save changes</button>
            <button class="btn btn-secondary btn-xs cancel" on:click={cancel}>Cancel</button>
        {/if}
    </div>
{:else}
    No editor for {property.configuration.itemType}
{/if}


<style>
    .edit-container {
        border-top: 0;
        border-left: 0;
        border-right: 0;
    }

    .editor-outer {
        position: absolute;
        z-index: 1000;
    }
</style>