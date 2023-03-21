<script lang="ts">
    import type {AttachmentProperty} from "@cozemble/model-attachment-core";
    import {attachmentModelChangedModelEvent, attachmentPropertyDescriptor} from '@cozemble/model-attachment-core'
    import {editorClient} from '@cozemble/model-editor-sdk'
    import MaybeErrorMessage from './MaybeErrorMessage.svelte'
    import type {Model} from "@cozemble/model-core";
    import {createEventDispatcher} from 'svelte'

    export let model: Model
    export let property: AttachmentProperty
    $: minAttachments = property.minAttachments ?? 0
    $: maxAttachments = property.maxAttachments ?? -1

    const formSectionErrorState = editorClient.getErrorState()

    $: errors = attachmentPropertyDescriptor.validateProperty(property)

    const dispatch = createEventDispatcher()

    function minChanged(event: Event) {
        const target = event.target as HTMLInputElement
        const value = target.valueAsNumber
        if (value === property.minAttachments) {
            return
        }
        dispatch('modelChanged', attachmentModelChangedModelEvent(model.id, property.id, value, maxAttachments))
    }

    function maxChanged(event: Event) {
        const target = event.target as HTMLInputElement
        const value = target.valueAsNumber
        if (value === property.maxAttachments) {
            return
        }
        dispatch('modelChanged', attachmentModelChangedModelEvent(model.id, property.id, minAttachments, value))
    }
</script>

<label for="minAttachments">Min Attachments</label>
<br/>
<input class="input input-bordered " type="number" id="minAttachments" value={minAttachments}
       min="0" on:blur={minChanged}/>

<MaybeErrorMessage
        showErrors={$formSectionErrorState.showErrors}
        {errors}
        key="minAttachments"/>

<br/>
<label for="maxAttachments">Min Attachments</label>
<br/>
<input class="input input-bordered " type="number" id="maxAttachments" value={maxAttachments}
       min="-1" on:blur={maxChanged}/>

<MaybeErrorMessage
        showErrors={$formSectionErrorState.showErrors}
        {errors}
        key="maxAttachments"/>
