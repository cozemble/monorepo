<script lang="ts">
    import type {AwsOcrResponse} from "../aws-ocr/awsOcrTypes";
    import {writable} from "svelte/store";
    import PageImage from "./PageImage.svelte";
    import type {StashPdfResponse} from "@cozemble/backend-aws-ocr-types";
    import JsonPreview from "./JsonPreview.svelte";
    import {
        displayOptions,
        generatingFirstJson,
        nextWizardState,
        type WizardState,
        wizardStateStore
    } from "./wizardState";
    import WizardNarration from "./WizardNarration.svelte";
    import type {JsonSchema} from "@cozemble/model-core";
    import GeneratingJsonSchema from "../fromDocument/GeneratingJsonSchema.svelte";
    import {formatJson, json, partial, type PartialJson} from "../fromDocument/partialJson";
    import {jsonToHtml} from "../fromDocument/jsonToHtml";

    export let awsOcrResponse: AwsOcrResponse
    export let upload: StashPdfResponse
    const pageIndex = writable(1)
    let wizardState = wizardStateStore(generatingFirstJson)
    let jsonSchema = writable(null as JsonSchema | null)
    let generatingJsonSchema: PartialJson | null = null
    const generateJson = writable(false)
    let lhsTabs: "document" | "schema" = "document"

    function onGenerating(_event: CustomEvent) {
    }

    function onGenerationComplete() {
        $wizardState = nextWizardState($wizardState)
        $generateJson = false
    }

    async function jsonSchemaGenerated(event: CustomEvent) {
        generatingJsonSchema = json(event.detail)
        $jsonSchema = JSON.parse(generatingJsonSchema.json)
        $generateJson = true
        $wizardState = displayOptions
    }

    function jsonSchemaPartial(event: CustomEvent) {
        generatingJsonSchema = partial(event.detail)
    }

    function keepLhsTabsSynced(state: WizardState) {
        if (state._type === 'generateJsonSchema') {
            lhsTabs = 'schema'
        }
    }

    $: keepLhsTabsSynced($wizardState)

</script>

<div class="flex p-8 border flex-col items-center">
    <WizardNarration {wizardState} {jsonSchema}/>
</div>
<div class="flex p-8 overflow-x-scroll">
    <div>
        <div class="tabs">
            <a class="tab tab-lifted" class:tab-active={lhsTabs === 'document'} on:click={() => lhsTabs = 'document'}>Document</a>
            {#if $jsonSchema || $wizardState._type === 'generateJsonSchema'}
                <a class="tab tab-lifted" class:tab-active={lhsTabs === 'schema'} on:click={() => lhsTabs = 'schema'}>JSON
                    Schema</a>
            {/if}
        </div>
        {#if lhsTabs === 'document'}
            <PageImage {upload} {pageIndex}/>
        {:else}
            {#if $wizardState._type === 'generateJsonSchema'}
                {@const html = jsonToHtml(awsOcrResponse.json.pages)}
                <GeneratingJsonSchema {html} on:generated={jsonSchemaGenerated} on:partial={jsonSchemaPartial}/>
                <div class="border overflow-y-scroll">
                    {#if generatingJsonSchema}
                        <pre>{formatJson(generatingJsonSchema)}</pre>
                    {/if}
                </div>
            {:else}
                <div class="flex mt-2 mb-2">
                    <button class="btn btn-secondary btn-sm">Edit</button>
                    <button class="btn btn-secondary btn-sm ml-2">Regenerate</button>
                </div>
                <pre>{JSON.stringify($jsonSchema, null, 2)}</pre>
            {/if}
        {/if}
    </div>
    <div class="ml-2 w-1/2">
        <div class="tabs">
            <a class="tab tab-lifted tab-active">JSON</a>
        </div>

        <JsonPreview {awsOcrResponse} {jsonSchema} {generateJson} on:generating={onGenerating}
                     on:generationComplete={onGenerationComplete}/>
    </div>
</div>