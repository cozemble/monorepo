<script lang="ts">
    import type {StringProperty} from '@cozemble/model-string-core'
    import {stringMultilineChanged, stringPropertyDescriptor} from '@cozemble/model-string-core'
    import {editorClient} from '@cozemble/model-editor-sdk'
    import MaybeErrorMessage from './MaybeErrorMessage.svelte'
    import type {Model} from "@cozemble/model-core";
    import {createEventDispatcher} from "svelte";

    export let model: Model
    export let property: StringProperty

    const formSectionErrorState = editorClient.getErrorState()
    const dispatch = createEventDispatcher()

    $: errors = stringPropertyDescriptor.validateProperty(property)

    function addRegexValidation() {
        property.validations = [
            ...property.validations,
            {_type: 'regex.validation', regex: '', message: ''},
        ]
    }

    function deleteValidation(index: number) {
        property.validations = property.validations.filter((_, i) => i !== index)
    }

    function multilineChanged(event: Event) {
        const target = event.target as HTMLInputElement
        dispatch('modelChanged', stringMultilineChanged(model.id, property.id, target.checked))
    }
</script>


<div class="flex mt-3">
    <input type="checkbox" checked={property.multiline} class="multiline-toggle checkbox"
           on:change={multilineChanged}/>
    <div class="ml-3">Multiple lines of text</div>
</div>

{#each property.validations as _validation, index}
    <div class="validation-container ml-9 px-5">
        <div class="validation-configuration">
            <label>Regex validation</label>
            <input bind:value={property.validations[index].regex} class="regex input input-bordered"/>
            <MaybeErrorMessage
                    showErrors={$formSectionErrorState.showErrors}
                    {errors}
                    key="validations.{index}.regex"/>
            <label>Error message</label>
            <input
                    bind:value={property.validations[index].message}
                    class="message input input-bordered"/>
            <MaybeErrorMessage
                    showErrors={$formSectionErrorState.showErrors}
                    {errors}
                    key="validations.{index}.message"/>
            <div class="validation-buttons mt-2">
                <button class="btn btn-ghost btn-active delete-validation" on:click={() => deleteValidation(index)}>
                    Delete
                </button>
            </div>
        </div>
    </div>
{/each}
<button
        type="button"
        class="btn btn-secondary add-validation-button mt-3"
        on:click|preventDefault={addRegexValidation}>Add regex validation
</button>

<style>
    label {
        display: block;
    }

    .validation-container {
        display: flex;
        flex-direction: row;
        border-left: 4px solid #e5e7eb;
    }

</style>
