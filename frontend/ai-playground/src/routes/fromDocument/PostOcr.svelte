<script lang="ts">
    import type {AwsOcrResponse} from "../aws-ocr/awsOcrTypes";
    import HandleAwsOcrResponse from "./HandleAwsOcrResponse.svelte";
    import {createEventDispatcher} from "svelte";
    import {writable} from "svelte/store";
    import type {Action} from "../ocr-as-html/ocrCorrectiveActions";
    import ConfigureTargetJsonSchema from "./ConfigureTargetJsonSchema.svelte";

    export let awsOcrResponse: AwsOcrResponse
    const pages = writable(awsOcrResponse.json.pages)
    const dispatch = createEventDispatcher()
    let actions = [] as Action[]
    let section: 'postProcessOcr' | 'configureJsonSchema' = 'postProcessOcr'

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
</script>

{#if section === "postProcessOcr"}
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
        <HandleAwsOcrResponse {pages} on:actions={onActions}/>
    </div>
{:else}
    <h1 class="text-center">Configure Target JSON Schema</h1>
    <ConfigureTargetJsonSchema pages={$pages} {actions} on:cancel={cancel}/>
{/if}