<script lang="ts">

    import {stringPropertyDescriptor} from "@cozemble/model-string-core";
    import StringPropertyConfigurer from "$lib/StringPropertyConfigurer.svelte";
    import {editorHost, emptyFormErrorState} from "@cozemble/model-editor-sdk";
    import {writable} from "svelte/store";
    import {afterUpdate} from "svelte";

    let property = stringPropertyDescriptor.newProperty()
    const formErrorState = writable(emptyFormErrorState())
    editorHost.setErrorState(formErrorState)

    afterUpdate(() => {
        console.log({formErrorState: $formErrorState})
    })
</script>

<StringPropertyConfigurer {property}/>
