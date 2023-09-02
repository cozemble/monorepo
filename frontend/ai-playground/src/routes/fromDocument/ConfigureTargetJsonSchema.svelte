<script lang="ts">
    import type {Page} from "@cozemble/backend-aws-ocr-types";
    import type {Action} from "../ocr-as-html/ocrCorrectiveActions";
    import {applyCorrections} from "../ocr-as-html/applyCorrections";
    import {jsonToHtml} from "./jsonToHtml";
    import type {JsonSchema} from "@cozemble/model-core";
    import {onMount} from "svelte";
    import {registerEverything} from "@cozemble/model-assembled";
    import EditSchema from "./EditSchema.svelte";
    import {createEventDispatcher} from "svelte";

    export let pages: Page[]
    export let actions: Action[]
    const mutatedPages = applyCorrections(actions, [], pages)
    const html = jsonToHtml(mutatedPages)
    const dispatch = createEventDispatcher()
    let jsonSchema: JsonSchema | null = null
    let sampleJson: any = null
    let generatingJson = false
    let headingText = "Configuring Target JSON Schema"
    let subheadingText = "We're using GPT 4 to 'guess' a JSON Schema from the document, because 3.5 is no good - it can take up to 30 seconds."
    let editingSchema = false

    onMount(() => {
        registerEverything()

        fetch("/fromDocument", {method: "POST", body: JSON.stringify({html})})
            .then(response => response.json())
            .then(response => onSchemaText(response.result))
    })

    function onSchemaText(schemaText: string) {
        jsonSchema = JSON.parse(schemaText)
        headingText = "Tweak the target JSON Schema"
        subheadingText = 'Edit this JSON schema to define the target data structure'
        generateJson()
        // const converted = convertSchemaToModels(schema)
        // reconfigureApp(converted)
        // newGenerationSessionId()
        // goto("/fromDocument/data")
    }

    async function generateJson() {
        try {
            generatingJson = true
            await fetch("/htmlToJson", {method: "POST", body: JSON.stringify({schema: jsonSchema, html})})
                .then(response => response.json())
                .then(response => sampleJson = JSON.parse(response.result))
        } finally {
            generatingJson = false
        }
    }

    function editSchema() {
        editingSchema = true
    }

    function schemaEdited(event:CustomEvent) {
        console.log(event.detail)
        jsonSchema = JSON.parse(event.detail)
        editingSchema = false
    }

    function next() {
        dispatch('schema', jsonSchema)
    }

</script>

<h1 class="text-center">{headingText}</h1>
<p class="text-center"><em>{subheadingText}</em></p>


{#if jsonSchema}
    {#if editingSchema}
        <div class="flex">
            <EditSchema schemaStr={JSON.stringify(jsonSchema, null, 2)} on:edited={schemaEdited} on:cancel={() => editingSchema = false}/>
        </div>
    {:else}
        <div class="mx-auto mb-8">
            <button class="btn btn-primary mt-4 btn-lg" on:click={next}>
                JSON looks OK - NEXT >>
            </button>

            <button class="btn btn-secondary mt-4 btn-lg" >
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
                    <pre>{JSON.stringify(jsonSchema, null, 2)}</pre>
                </div>
            </div>
            <div class="ml-4">
                {#if generatingJson}
                    <h4 class="mx-auto">Generating json</h4>
                    <p class="text-center mb-8"><em>Using GPT 3.5 to convert the document to this JSON schema</em></p>
                {:else}
                    <div class="flex">
                        <h4 class="mx-auto">Target JSON</h4>
                        <button class="ml-4 btn btn-primary btn-xs" on:click={generateJson}>Regenerate</button>
                    </div>
                    <div class="border rounded p-4 overflow-y-auto">
                        <pre>{JSON.stringify(sampleJson, null, 2)}</pre>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
{/if}

