<script lang="ts">
    import StringPropertyConfigurer from '../../lib/StringPropertyConfigurer.svelte'
    import {editorHost, emptyFormErrorState} from '@cozemble/model-editor-sdk'
    import {writable} from 'svelte/store'
    import {stringPropertyFns} from '@cozemble/model-string-core'
    import {modelFns, modelOptions} from "@cozemble/model-api";

    let property = stringPropertyFns.newInstance('Property 1')
    const model = modelFns.newInstance('Model 1', modelOptions.withSlot(property))
    const formErrorState = writable(emptyFormErrorState())
    editorHost.setErrorState(formErrorState)
</script>

<StringPropertyConfigurer {model} {property}/>
