<script lang="ts">
    import {onMount} from 'svelte'

    import {registerAllProperties, registerAllPropertyConfigurers} from "@cozemble/model-assembled";
    import ModelEditor from "$lib/ModelEditor.svelte";
    import {allModels, bootstrapHost, host} from './host'
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";

    let mounted = false
    let firstModel: EventSourcedModel | null = null
    onMount(() => {
        registerAllProperties()
        registerAllPropertyConfigurers()
        mounted = true
        bootstrapHost(localStorage)
        firstModel = $allModels[0]
    })


</script>
{#if mounted && firstModel}
    <ModelEditor modelId={firstModel.model.id} {allModels} {host}/>
{/if}
