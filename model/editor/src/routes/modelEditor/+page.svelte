<script lang="ts">
    import {onMount} from 'svelte'

    import {registerAllProperties, registerAllPropertyConfigurers} from "@cozemble/model-assembled";
    import ModelEditor from "$lib/ModelEditor.svelte";
    import {modelFns} from "@cozemble/model-api";

    const storageKey = 'com.cozemble.model.editor.route.page'
    let model = modelFns.newInstance("My model")

    let mounted = false
    onMount(() => {
        registerAllProperties()
        registerAllPropertyConfigurers()
        mounted = true
        const item = localStorage.getItem(storageKey)
        if (item) {
            model = JSON.parse(item)
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
