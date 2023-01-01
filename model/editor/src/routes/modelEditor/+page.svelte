<script lang="ts">
    import {onMount} from 'svelte'

    import {registerAllProperties, registerAllPropertyConfigurers} from "@cozemble/model-assembled";
    import ModelEditor from "$lib/ModelEditor.svelte";
    import {modelFns, modelIdFns} from "@cozemble/model-api";
    import type {ModelEditorHost} from "$lib/ModelEditorHost";
    import type {Model, ModelId} from "@cozemble/model-core";
    import {mandatory} from "@cozemble/lang-util";

    const storageKey = 'com.cozemble.model.editor.route.page'
    let allModels: Model[] = []

    let mounted = false
    onMount(() => {
        registerAllProperties()
        registerAllPropertyConfigurers()
        mounted = true
        const item = localStorage.getItem(storageKey)
        if (item) {
            allModels = JSON.parse(item)
        } else {
            allModels = [modelFns.newInstance("My model")]
        }
    })

    function modelChanged(model: Model) {
        allModels = allModels.map(m => modelIdFns.equals(m.id, model.id) ? model : m)
        localStorage.setItem(storageKey, JSON.stringify(allModels))
    }

    const host: ModelEditorHost = {
        modelChanged,
        modelAdded(model) {
            allModels = [...allModels, model]
            localStorage.setItem(storageKey, JSON.stringify(allModels))
        },
        modelWithId(id: ModelId): Model {
            return mandatory(allModels.find(m => modelIdFns.equals(m.id, id)),`Model with id ${id} not found`)
        }
    }
</script>
{#if mounted}
    <ModelEditor modelId={allModels[0].id} {host}/>
{/if}
