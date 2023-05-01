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
    <div class="flex mt-3">
        <input type="checkbox" checked={property.required} class="required-toggle checkbox"
               on:change={(event) => booleanChanged(event, 'required')}/>
        <div class="ml-3">Required</div>
    </div>
{/if}

{#if propertyDescriptor?.isUniqueable}
    <div class="flex mt-3">
        <input type="checkbox" checked={property.unique} class="unique-toggle checkbox"
               on:change={(event) => booleanChanged(event, 'unique')}/>
        <div class="ml-3">Unique</div>
    </div>
{/if}

{#if configurer}
    <svelte:component this={configurer} {model} {property} on:modelChanged={onModelChangedEvent}/>
{/if}

<style>
    label {
        display: block;
    }
</style>