<script lang="ts">
    import {allModels} from "./host";
    import type {ModelEditorHost} from "@cozemble/model-editor";
    import {modelFns} from "@cozemble/model-api";
    import {ModelEditor} from "@cozemble/model-editor";

    export let host: ModelEditorHost

    function addModel() {
        host.modelAdded(modelFns.newInstance("Untitled model"))
    }
</script>
{#if $allModels.length === 0}
    <p>Everything in cozemble is based on models. Click the button below to create your first one.</p>
    <button type="button" on:click={addModel}>Add model</button>
{:else}
    <ModelEditor {allModels} {host} modelId={$allModels[0].model.id}/>
{/if}

<style>
    button {
        margin-top: 0.5em;
    }
</style>