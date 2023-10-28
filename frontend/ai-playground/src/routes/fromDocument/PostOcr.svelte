<script lang="ts">
    import type {AwsOcrResponse} from "../aws-ocr/awsOcrTypes";
    import HandleAwsOcrResponse from "./HandleAwsOcrResponse.svelte";
    import {createEventDispatcher} from "svelte";
    import {writable} from "svelte/store";
    import type {Action} from "../ocr-as-html/ocrCorrectiveActions";
    import ConfigureTargetJsonSchema from "./ConfigureTargetJsonSchema.svelte";
    import type {JsonSchema} from "@cozemble/model-core";
    import ApiExplainer from "./ApiExplainer.svelte";
 
    export let awsOcrResponse: AwsOcrResponse
    const pages = writable(awsOcrResponse.json.pages)
    const dispatch = createEventDispatcher()

    /** Correction actions to be applied to the OCR result */
    let actions = [] as Action[]
    /** Is the OCR correction step done */
    let section: 'postProcessOcr' | 'configureJsonSchema' = 'postProcessOcr'
    let jsonSchema: JsonSchema | null = null
    let initialActions = [] as Action[]

    function cancel() {
        dispatch('cancel')
    }

    function configureJson() {
        section = 'configureJsonSchema'
    }

    function onActions(event: CustomEvent) {
        actions = event.detail
        console.log({actions})
    }

    function jsonSchemaDefined(event: CustomEvent) {
        jsonSchema = event.detail
    }

    function backToCorrections(event: CustomEvent) {
        initialActions = event.detail
        section = 'postProcessOcr'
    }


</script>

<!-- 
    @component
    Perform OCR corrections, then configure the target JSON schema
 -->

{#if section === "postProcessOcr"}
    <!-- OCR Corrections -->
    <h1 class="text-center">OCR Post Processing</h1>

    <div class="mx-auto mb-4">
        <button class="btn btn-primary mt-4 btn-lg" on:click={configureJson}>
            OCR looks OK - NEXT >>
        </button>

        <button class="btn btn-secondary mt-4 btn-lg" on:click={cancel}>
            Cancel
        </button>
    </div>
    <div class="border rounded p-4">
        <HandleAwsOcrResponse {pages} {initialActions} on:actions={onActions}/>
    </div>
{:else}
    {#if jsonSchema === null}
        <!-- Create JSON Schema  -->
        <ConfigureTargetJsonSchema pages={$pages} {actions} on:cancel={cancel} on:schema={jsonSchemaDefined}
                                   on:corrections={backToCorrections}/>
    {:else}
        <!-- Finished -->
        <ApiExplainer/>
    {/if}
{/if}