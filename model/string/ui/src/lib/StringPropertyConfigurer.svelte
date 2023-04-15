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

<label class="label">
    <input
            type="checkbox"
            name="checkbox"
            value="text"
            checked={property.multiline}
            class="multiline-toggle"
            on:change={multilineChanged}/>
    Multiple Lines
</label>

{#each property.validations as _validation, index}
    <div class="validation-container">
        <div class="validation-configuration">
            <label>Regex validation</label><br/>
            <input bind:value={property.validations[index].regex} class="regex"/>
            <br/>
            <MaybeErrorMessage
                    showErrors={$formSectionErrorState.showErrors}
                    {errors}
                    key="validations.{index}.regex"/>
            <label>Error message</label><br/>
            <input
                    bind:value={property.validations[index].message}
                    class="message"/>
            <br/>
            <MaybeErrorMessage
                    showErrors={$formSectionErrorState.showErrors}
                    {errors}
                    key="validations.{index}.message"/>
        </div>
        <div class="validation-buttons">
            <button on:click={() => deleteValidation(index)} class="delete-validation">Delete
            </button>
        </div>
    </div>
{/each}
<button
        type="button"
        class="btn btn-secondary add-validation-button"
        on:click|preventDefault={addRegexValidation}>Add regex validation
</button>

<style>
    label {
        display: block;
    }

    .add-validation-button {
        margin-top: 10px;
    }

    .validation-container {
        display: flex;
        flex-direction: row;
    }

    .validation-buttons {
        margin-left: 10px;
    }

    .validation-buttons {
        display: flex;
    }
</style>
