<script lang="ts">
    import type {ReferenceProperty} from "@cozemble/model-reference-core";
    import {referencePropertyDescriptor} from '@cozemble/model-reference-core'
    import {editorClient} from '@cozemble/model-editor-sdk'
    import MaybeErrorMessage from '$lib/MaybeErrorMessage.svelte'
    import {afterUpdate} from "svelte";

    export let property: ReferenceProperty

    const formSectionErrorState = editorClient.getErrorState()

    $: errors = referencePropertyDescriptor.validateProperty(property)

    afterUpdate(() => {
        console.log('property', property, errors)
    })
</script>

<MaybeErrorMessage
        showErrors={true}
        {errors}
        key="referencedModels"/>
