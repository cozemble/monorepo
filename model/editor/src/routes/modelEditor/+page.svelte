<script lang="ts">
    import {onMount} from 'svelte'

    import {registerAllProperties, registerAllPropertyConfigurers} from "@cozemble/model-assembled";
    import type {Model} from "@cozemble/model-core";
    import ModelEditor from "./ModelEditor.svelte";

    let mounted = false
    onMount(() => {
        registerAllProperties()
        registerAllPropertyConfigurers()
        mounted = true
    })

    let model: Model = {
        _type: "model",
        id: "1",
        name: "My model",
        properties: []
    }
</script>
{#if mounted}
    <ModelEditor {model}/>
{/if}
