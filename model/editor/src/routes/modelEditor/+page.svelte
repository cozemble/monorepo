<script lang="ts">
    import {onMount} from 'svelte'

    import {registerAllProperties, registerAllPropertyConfigurers} from "@cozemble/model-assembled";
    import type {Model} from "@cozemble/model-core";
    import ModelEditor from "$lib/ModelEditor.svelte";

    const storageKey = 'com.cozemble.model.editor.route.page'
    let model: Model = {
        _type: "model",
        id: "1",
        name: "My model",
        properties: []
    }

    let mounted = false
    onMount(() => {
        registerAllProperties()
        registerAllPropertyConfigurers()
        mounted = true
        if(localStorage.getItem(storageKey)) {
            model = JSON.parse(localStorage.getItem(storageKey))
        }
    })


    function modelChanged(event: CustomEvent) {
        model = event.detail.model
        localStorage.setItem(storageKey, JSON.stringify(model))
    }
</script>
{#if mounted}
    <ModelEditor {model} on:changed={modelChanged}/>
{/if}
