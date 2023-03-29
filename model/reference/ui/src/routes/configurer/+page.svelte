<script lang="ts">
    import ReferencePropertyConfigurer from '../../lib/ReferencePropertyConfigurer.svelte'
    import {editorHost, emptyFormErrorState} from '@cozemble/model-editor-sdk'
    import {writable} from 'svelte/store'
    import {referencePropertyFns} from "@cozemble/model-reference-core";
    import {modelFns} from "@cozemble/model-api";
    import {modelOptions} from "@cozemble/model-api";
    import type {ReferenceProperty} from "@cozemble/model-reference-core";

    const model = modelFns.newInstance('Invoice', modelOptions.withProperty(referencePropertyFns.newInstance('Property 1')))
    const property = modelFns.properties(model)[0] as ReferenceProperty
    const formErrorState = writable(emptyFormErrorState())
    editorHost.setErrorState(formErrorState)

    const customerModel = modelFns.newInstance('Customer')
    const models = writable([customerModel])
    editorHost.setModels(models)

    function onModelChanged(event: CustomEvent) {
        console.log('model changed', event)
    }
</script>

<ReferencePropertyConfigurer {model} {property} on:modelChanged={onModelChanged}/>
