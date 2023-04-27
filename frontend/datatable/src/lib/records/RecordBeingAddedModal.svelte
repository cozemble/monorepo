<script lang="ts">
    import type {RecordBeingAdded} from "./helperTypes";
    import {onMount} from 'svelte'
    import {positionModal} from "../modelUi";
    import {StackingRecordEditor} from '@cozemble/data-paginated-editor'
    import {RecordEditContext, type RecordSaveOutcome} from "@cozemble/data-paginated-editor";
    import {currentUserId} from "../stores/currentUserId";
    import type {SystemConfiguration} from "@cozemble/model-core";
    import {attachmentsManager, recordSearcher} from "../appBackend";
    import {modelViews} from "../stores/modelViews";
    import type {RecordsContext} from "./RecordsContext";
    import type {EventSourcedDataRecord} from "@cozemble/data-editor-sdk";
    import {eventSourcedDataRecordFns} from "@cozemble/data-editor-sdk";

    export let recordsContext: RecordsContext
    export let recordBeingAdded: RecordBeingAdded
    export let systemConfiguration: SystemConfiguration
    const {models, model} = recordBeingAdded
    let modal: HTMLDivElement

    onMount(() => positionModal(modal, recordBeingAdded.anchorElement))

    async function justSaveNewRecord(
        newRecord: EventSourcedDataRecord,
    ): Promise<RecordSaveOutcome> {
        return await recordsContext.saveNewRecord(newRecord)
    }

    function onCancel() {

    }

</script>

<div class="coz-modal" bind:this={modal}>
    <div class="modal-box mx-2">
        <StackingRecordEditor
                {recordSearcher}
                {attachmentsManager}
                modelViews={$modelViews}
                recordEditContext={new RecordEditContext( models, justSaveNewRecord,eventSourcedDataRecordFns.newInstance(models, model.id, $currentUserId), justSaveNewRecord, onCancel, `Add new ${model.name.value}`,systemConfiguration )}/>
    </div>
</div>