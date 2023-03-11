<script lang="ts">
    import ReferencePropertyConfigurer from '$lib/ReferencePropertyConfigurer.svelte'
    import {editorHost, emptyFormErrorState} from '@cozemble/model-editor-sdk'
    import {writable} from 'svelte/store'
    import {referencePropertyFns} from "@cozemble/model-reference-core";

    let property = referencePropertyFns.newInstance('Property 1')
    const formErrorState = writable(emptyFormErrorState())
    editorHost.setErrorState(formErrorState)
</script>

<ReferencePropertyConfigurer {property}/>
