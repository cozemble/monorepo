<script lang="ts">
    import {createEventDispatcher, onMount} from 'svelte';
    import {ModelViewEditorWithPreview} from "@cozemble/frontend-sdk-components";
    import type {DataRecord, Model, ModelView} from "@cozemble/model-core";
    import {modelViewFns, summaryViewFns} from "@cozemble/model-core";
    import {writable, type Writable} from "svelte/store";
    import type {JustErrorMessage} from "@cozemble/lang-util";
    import type {ModelViewManager} from "@cozemble/data-editor-sdk";

    export let model: Model
    export let models: Model[]
    export let sampleRecords: DataRecord[]
    export let modelViewManager: ModelViewManager
    const dispatch = createEventDispatcher()
    let toggleButton: HTMLLabelElement;
    let saveError: JustErrorMessage | null = null

    const modelView: Writable<ModelView> = writable(modelViewFns.newInstance("Summary View", model.id, summaryViewFns.empty()))
    onMount(() => {
        toggleButton.click()
    })

    function clearTemplate() {
        modelView.update(m => modelViewFns.newInstance("Default", model.id, summaryViewFns.empty()))
    }

    function cancel() {
        dispatch("cancel")
    }

    async function save() {
        saveError = modelViewFns.validate($modelView)
        if (saveError) {
            return
        }
        await modelViewManager.saveModelView($modelView)
        dispatch("saved")
    }
</script>
<!-- The button to open modal -->
<label for="my-modal" class="btn invisible" bind:this={toggleButton}>open modal</label>

<!-- Put this part before </body> tag -->
<input type="checkbox" id="my-modal" class="modal-toggle"/>
<div class="modal">
    <div class="modal-box">
        <h3 class="my-3">Configure view for {model.name.value}</h3>
        <ModelViewEditorWithPreview {modelView} {models} {sampleRecords}/>
        <p class="text-sm ml-2">Click on the options at the top to include them in the template</p>
        {#if saveError}
            <div class="alert alert-error shadow-lg my-3">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none"
                         viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>{saveError.message}</span>
                </div>
            </div>
        {/if}
        <div class="mt-3">
            <button class="btn btn-primary" on:click={save}>Save view</button>
            <button class="btn" on:click={clearTemplate}>Clear</button>
            <button class="btn" on:click={cancel}>Cancel</button>
        </div>
    </div>
</div>

<style>
    .modal-box {
        max-width: 80rem;
    }
</style>