<script lang="ts">
    import {EditableName} from "@cozemble/ui-atoms";
    import type {ModelEditorHost} from "$lib/ModelEditorHost";
    import ModelStructureEditor from "$lib/ModelStructureEditor.svelte";
    import type {ModelId} from "@cozemble/model-core";

    export let modelId: ModelId
    export let host: ModelEditorHost

    $: model = host.modelWithId(modelId)

    function onNameChange(name: string) {
        model = {...model, name}
        host.modelChanged(model)
    }
</script>

{#if model}
    <EditableName nameable={{name:model.name}} {onNameChange} extraClass="model-name"/>

    <ModelStructureEditor {modelId} {host}/>
{/if}
