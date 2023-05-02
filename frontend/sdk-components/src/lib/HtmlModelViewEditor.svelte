<script lang="ts">
    import type {Model, ModelHtmlTemplate, ModelPath, ModelPathElement} from "@cozemble/model-core";
    import {modelFns, modelPathFns} from "@cozemble/model-api";
    import {type HtmlMarkupValue, htmlTemplateAsParts, toLines} from "./htmlTemplateAsParts";
    import Part from "./Part.svelte";

    export let view: ModelHtmlTemplate
    export let model: Model
    export let models: Model[]
    export let onModelHtmlTemplateChanged: (view: ModelHtmlTemplate) => void

    const propertyPaths = modelFns.allPaths(models, model).filter(path => path.lastElement._type === "property")
    $: parts = htmlTemplateAsParts(view.template, propertyPaths)
    $: lines = toLines(parts)

    function addPath(path: ModelPath<ModelPathElement>) {
        const pathStr = modelPathFns.toDottedNamePath(path).value
        if (view.template.endsWith("}}")) {
            view = {...view, template: view.template + " "}
        }
        const newTemplate = view.template + `{{${pathStr}}}`
        view = {...view, template: newTemplate}
        onModelHtmlTemplateChanged(view)
    }

    function addHtmlMarkup(markup: HtmlMarkupValue) {
        view = {...view, template: view.template + markup}
        onModelHtmlTemplateChanged(view)
    }
</script>
<h6 class="mt-3">Template options</h6>
<div>
    {#each propertyPaths as propertyPath}
        <div class="badge badge-ghost gap-2 p-3 m-1" on:click={() => addPath(propertyPath)}>
            {modelPathFns.toDottedNamePath(propertyPath).value}
        </div>
    {/each}
    <div class="badge gap-2 p-3 m-1" on:click={() => addHtmlMarkup(' ')}>
        Space
    </div>
    <div class="badge gap-2 p-3 m-1" on:click={() => addHtmlMarkup('<br/>')}>
        New line
    </div>
</div>
<h6 class="mt-3"> {model.name.value} view template</h6>
<div class="rounded border border-base-300 p-2 expression">
    {#each lines as line}
        <div class="mb-2">
            {#each line as part}
                <Part {part}/>
            {/each}
        </div>
    {/each}
</div>

<style>
    .expression {
        min-height: 4rem;
    }
</style>