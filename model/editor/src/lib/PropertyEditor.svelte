<script lang="ts">
    import type {Model, Property} from '@cozemble/model-core'
    import {propertyDescriptors,} from '@cozemble/model-core'
    import {propertyConfigurerRegistry} from '@cozemble/model-assembled'
    import type {ModelChangeHandler} from './ModelEditorHost'
    import {coreModelEvents} from '@cozemble/model-event-sourced'

    export let modelChangeHandler: ModelChangeHandler
    export let model: Model
    export let property: Property
    $:propertyDescriptor = propertyDescriptors.get(property.propertyType) ?? null


    function onModelChangedEvent(event: CustomEvent) {
        console.log({event})
        modelChangeHandler.modelChanged(model.id, event.detail)
    }

    $: configurer = propertyConfigurerRegistry.get(property.propertyType)

    function booleanChanged(event: Event, booleanName: 'required' | 'unique') {
        const target = event.target as HTMLInputElement
        modelChangeHandler.modelChanged(
            model.id,
            coreModelEvents.booleanPropertyChanged(
                model.id,
                property.id,
                booleanName,
                target.checked,
            ),
        )
    }

</script>

{#if propertyDescriptor?.isRequireable}
    <label class="label">
        <input
                type="checkbox"
                name="checkbox"
                value="text"
                checked={property.required}
                class="required-toggle"
                on:change={(event) => booleanChanged(event, 'required')}/>
        Required
    </label>

{/if}

{#if propertyDescriptor?.isUniqueable}
    <label class="label">
        <input
                type="checkbox"
                name="checkbox"
                value="text"
                bind:checked={property.unique}
                class="unique-toggle" on:change={(event) => booleanChanged(event, 'unique')}/>
        Unique
    </label>
{/if}

{#if configurer}
    <svelte:component this={configurer} {model} {property} on:modelChanged={onModelChangedEvent}/>
{/if}

<style>
    label {
        display: block;
    }
</style>