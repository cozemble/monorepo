<script lang="ts">
    import type {Model, ModelView} from "@cozemble/model-core";
    import {modelFns} from "@cozemble/model-api";
    import type {Writable} from "svelte/store";
    import HtmlModelViewEditor from "./HtmlModelViewEditor.svelte";
    import type {ModelHtmlTemplate} from "@cozemble/model-core";

    export let modelView: Writable<ModelView>
    export let models: Model[]
    const model = modelFns.findById(models, $modelView.modelId)

    function onModelHtmlTemplateChanged(view:ModelHtmlTemplate) {
        $modelView.view.view = view
    }
</script>
{#if $modelView.view._type === 'summary.view' && $modelView.view.view._type === 'model.html.template'}
    <HtmlModelViewEditor {models} {model} view={$modelView.view.view} {onModelHtmlTemplateChanged}/>
{:else}
    <p>Don't know how to handle model view</p>
{/if}