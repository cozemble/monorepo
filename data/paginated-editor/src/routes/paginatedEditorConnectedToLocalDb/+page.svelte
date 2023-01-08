<script lang="ts">
    import type {Model} from '@cozemble/model-core'
    import PaginatedEditor from '$lib/PaginatedEditor.svelte'
    import {onMount} from 'svelte'
    import {
        registerAllProperties,
        registerAllPropertyEditors,
        registerAllPropertyViewers,
    } from '@cozemble/model-assembled'

    let models: Model[] = []
    let model: Model | null = null

    async function loadModels() {
        const response = await fetch('http://localhost:3000/api/v1/model/list', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        if (response.ok) {
            models = await response.json()
            console.log({models})
        } else {
            console.error('Error loading models', response)
        }
    }


    onMount(() => {
        registerAllProperties()
        registerAllPropertyViewers()
        registerAllPropertyEditors()
        loadModels()
    })

    function useModel(m: Model) {
        model = m
    }
</script>

{#each models as model}
    <a href="#!" on:click={() => useModel(model)}>{model.name.value}</a><br/>
{/each}
{#if model}
    {#key model.id}
        <PaginatedEditor {model} records={[]}/>
    {/key}
{/if}
