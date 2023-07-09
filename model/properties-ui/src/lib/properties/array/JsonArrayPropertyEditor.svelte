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
</script>

{#if value}
    {#if editor}
        {#each value as v, index}
            <div class="edit-container border border-base-300 mb-2">
                <svelte:component this={editor} property={arrayItemProperty} value={v}
                                  changeHandler={makeChangeHandler(index)}
                                  closeHandler={makeCloseHandler(index)}/>
                <MaybeError errors={errors[index]}/>
            </div>
        {/each}

        <button class="btn btn-primary btn-xs" on:click={addItem}>Add item</button>
        {#if valueChanged}
            <button class="btn btn-secondary btn-xs" on:click={save}>Save</button>
            <button class="btn btn-secondary btn-xs" on:click={cancel}>Cancel</button>
        {/if}
    {:else}
        No editor for {property.configuration.itemType}
    {/if}
{/if}

<style>
    .edit-container {
        border-top: 0;
        border-left: 0;
        border-right: 0;
    }
</style>