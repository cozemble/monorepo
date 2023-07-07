<script lang="ts">
    import type {Model, Property} from '@cozemble/model-core'
    import {propertyDescriptors,} from '@cozemble/model-core'
    import {propertyConfigurerRegistry} from '@cozemble/model-assembled'
    import type {EventSourcedModelList} from "@cozemble/model-event-sourced";
    import {coreModelEvents, eventSourcedModelListFns} from '@cozemble/model-event-sourced'
    import type {Writable} from "svelte/store";
    import {editorClient} from "@cozemble/model-editor-sdk";

    export let modelList: Writable<EventSourcedModelList>
    export let model: Model
    export let property: Property

    const errorState = editorClient.getErrorState()
    $:propertyDescriptor = propertyDescriptors.get(property.propertyType) ?? null

    function onModelChangedEvent(event: CustomEvent) {
        modelList.update(list => eventSourcedModelListFns.addModelEvent(list, event.detail))
    }

    $: configurer = propertyConfigurerRegistry.forSlot(property)

    function booleanChanged(event: Event, booleanName: 'required' | 'unique') {
        const target = event.target as HTMLInputElement
        modelList.update(list => eventSourcedModelListFns.addModelEvent(list, coreModelEvents.booleanPropertyChanged(
            model.id,
            property.id,
            booleanName,
            target.checked,
        )))
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
    <svelte:component this={configurer} {model} {property} showErrors={$errorState.showErrors}
                      on:modelChanged={onModelChangedEvent}/>
{/if}