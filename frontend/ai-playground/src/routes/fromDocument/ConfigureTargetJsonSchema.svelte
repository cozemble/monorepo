<script lang="ts">
    import type {Page} from "@cozemble/backend-aws-ocr-types";
    import type {Action} from "../ocr-as-html/ocrCorrectiveActions";
    import {applyCorrections} from "../ocr-as-html/applyCorrections";
    import {jsonToHtml} from "./jsonToHtml";
    import {createEventDispatcher} from "svelte";
    import GeneratingJsonSchema from "./GeneratingJsonSchema.svelte";
    import EditSchema from "./EditSchema.svelte";
    import type {PartialJson} from "./partialJson"
    import {formatJson, json, partial} from "./partialJson";
    import GenerateJson from "./GenerateJson.svelte";

    export let pages: Page[]
    export let actions: Action[]
    const mutatedPages = applyCorrections(actions, [], pages)
    const html = jsonToHtml(mutatedPages)
    const dispatch = createEventDispatcher()
    let jsonSchema: PartialJson | null = null
    let sampleJson: PartialJson | null = null
    let generatingJson = false
    let editingSchema = false


    function editSchema() {
        editingSchema = true
    }

    function schemaEdited(event: CustomEvent) {
        jsonSchema = json(event.detail)
        editingSchema = false
    }

    function next() {
        dispatch('schema', jsonSchema)
    }

    function jsonSchemaGenerated(event: CustomEvent) {
        jsonSchema = json(event.detail)
        if(sampleJson === null) {
            generateJson()
        }
    }
    function jsonSchemaPartial(event: CustomEvent) {
        jsonSchema = partial(event.detail)
    }

    function jsonGenerated(event: CustomEvent) {
        sampleJson = json(event.detail)
        generatingJson = false
    }

    function jsonPartial(event: CustomEvent) {
        sampleJson = partial(event.detail)
    }

    function generateJson() {
        generatingJson = true
    }

    let headingText = "Creating initial version of output  JSON Schema"
    let subheadingText = "We're using GPT 4 to 'guess' a JSON Schema from the document, because 3.5 is no good - it can take up to 30 seconds."

    function backToCorrections() {
        dispatch('corrections', actions)
    }
</script>


{#if generatingJson && jsonSchema}
    <GenerateJson {html} schema={jsonSchema.json} on:generated={jsonGenerated} on:partial={jsonPartial}/>
{/if}

{#if jsonSchema === null || jsonSchema._type === "partial"}
    <GeneratingJsonSchema {html} on:generated={jsonSchemaGenerated} on:partial={jsonSchemaPartial}/>
{/if}

<h1 class="text-center">{headingText}</h1>
<p class="text-center"><em>{subheadingText}</em></p>


{#if jsonSchema}
    {#if editingSchema}
        <div class="flex">
            <EditSchema schemaStr={jsonSchema.json} on:edited={schemaEdited}
                        on:cancel={() => editingSchema = false}/>
        </div>
    {:else}
        <div class="mx-auto mb-8">
            <button class="btn btn-secondary mt-4 btn-lg" on:click={backToCorrections}>
                &lt;&lt; Back to Corrections
            </button>
            <button class="btn btn-primary mt-4 btn-lg" on:click={next}>
                JSON looks OK - NEXT >>
            </button>

            <button class="btn btn-secondary mt-4 btn-lg">
                Cancel
            </button>
        </div>
        <div class="flex">
            <div>
                <div class="flex">
                    <h4 class="mx-auto">Target JSON Schema</h4>
                    <button class="ml-4 btn btn-primary btn-xs" on:click={editSchema}>Edit</button>
                </div>
                <div class="border rounded p-4 overflow-y-auto">
                    <pre>{formatJson(jsonSchema)}</pre>
                </div>
            </div>
            <div class="ml-4">
                <div class="flex">
                    <h4 class="mx-auto">Target JSON</h4>
                    <button class="ml-4 btn btn-primary btn-xs" on:click={generateJson}>Regenerate</button>
                </div>
                <div class="border rounded p-4 overflow-y-auto">
                    <pre>{sampleJson ? formatJson(sampleJson) : ""}</pre>
                </div>
            </div>
        </div>
    {/if}
{/if}

