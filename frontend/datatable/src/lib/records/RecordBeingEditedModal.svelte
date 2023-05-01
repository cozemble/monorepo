<script lang="ts">
    import type {RecordBeingAdded, RecordBeingEdited} from "./helpers";
    import {createEventDispatcher, onMount} from 'svelte'
    import {positionModal} from "../modelUi";
    import {RecordEditContext, type RecordSaveOutcome, StackingRecordEditor} from '@cozemble/data-paginated-editor'
    import {currentUserId} from "../stores/currentUserId";
    import {attachmentsManager, recordSearcher} from "../appBackend";
    import {modelViews} from "../stores/modelViews";
    import type {RecordsContext} from "./RecordsContext";
    import type {EventSourcedDataRecord} from "@cozemble/data-editor-sdk";
    import {eventSourcedDataRecordFns} from "@cozemble/data-editor-sdk";
    import {systemConfiguration} from "../stores/systemConfiguration";

    export let recordsContext: RecordsContext
    export let recordBeingEdited: RecordBeingEdited
    const dispatch = createEventDispatcher()
    const {models, model} = recordBeingEdited
    let modal: HTMLDivElement

    onMount(() => positionModal(modal, recordBeingEdited.anchorElement))

    async function justSaveNewRecord(
        newRecord: EventSourcedDataRecord,
    ): Promise<RecordSaveOutcome> {
        return await recordsContext.saveNewRecord(newRecord)
    }

    function onCancel() {
        dispatch('cancel')
    }

    async function onSaveRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
        const outcome = await recordsContext.saveExistingRecord(newRecord)
        dispatch('edited', {newRecord})
        return outcome
    }

</script>

<div class="coz-modal" bind:this={modal}>
    <div class="modal-box mx-2">
        <StackingRecordEditor
                {recordSearcher}
                {attachmentsManager}
                modelViews={$modelViews}
                recordEditContext={new RecordEditContext( models, justSaveNewRecord,eventSourcedDataRecordFns.fromRecord(models, recordBeingEdited.record), onSaveRecord, onCancel, `Edit ${model.name.value}`,$systemConfiguration )}/>
    </div>
</div>