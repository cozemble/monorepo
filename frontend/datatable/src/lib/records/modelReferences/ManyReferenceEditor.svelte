<script lang="ts">
    import type {DataRecordId} from "@cozemble/model-core";
    import type {DataRecord, ModelReference} from "@cozemble/model-core";
    import RenderModelReferenceView from "$lib/records/modelReferences/RenderModelReferenceView.svelte";
    import type {EditorParams} from "$lib/records/modelReferences/editorHelper";
    import SingleReferenceSelector from "$lib/records/modelReferences/SingleReferenceSelector.svelte";
    import {createEventDispatcher} from "svelte";

    export let selectedRecordIds: DataRecordId[]
    export let editorParams: EditorParams
    export let record: DataRecord
    export let modelReference: ModelReference

    const dispatch = createEventDispatcher()

    function referenceAdded(event: CustomEvent<{ record: DataRecord | null }>) {
        const selectedRecord = event.detail.record
        if (selectedRecord) {
            selectedRecordIds = [...selectedRecordIds, selectedRecord.id]
        }
    }

    function removeReference(reference: DataRecordId) {
        selectedRecordIds = selectedRecordIds.filter(id => id !== reference)
    }

    function cancel() {
        dispatch("cancel")
    }

    function save() {
        dispatch("save", {selectedRecordIds})
    }

</script>

<div class="p-2 border rounded bg-base-100 pl-4 pr-4 pb-8">
    <div class="existing-references">
        <h4>Edit {modelReference.name.value}</h4>
        {#each selectedRecordIds as selectedRecordId, index}
            <div class="my-3 flex justify-between">
                <RenderModelReferenceView referencedRecordId={selectedRecordId}
                                          referencedModelId={editorParams.referencedModelId}
                                          recordId={record.id} summaryView={editorParams.summaryView}/>
                <button class="btn btn-xs ml-1 remove-reference-{index}"
                        on:click={() => removeReference(selectedRecordId)}>Remove
                </button>
            </div>
        {/each}
    </div>
    <div class="mt-4">
        <div class="font-bold mb-2">Add another</div>
        <SingleReferenceSelector selectedRecordIds={[]} {editorParams} {record}
                                 {modelReference}
                                 showSelected={false}
                                 on:selected={referenceAdded}/>
    </div>
    <div class="mt-4 flex justify-center">
        <button class="btn btn-primary save-references" on:click={save}>Save</button>
        <button class="btn btn-secondary ml-2 cancel-references" on:click={cancel}>Cancel</button>
    </div>
</div>
