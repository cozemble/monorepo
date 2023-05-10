<script lang="ts">
    import {dataRecordsTableOptions} from "../DataRecordsTableOptions";
    import type {DataRecord, DataRecordId, Model} from "@cozemble/model-core";
    import SlotTh from "../SlotTh.svelte";
    import DataEntryRow from "../entry/DataEntryRow.svelte";
    import {writable} from "svelte/store";
    import {singleRecordEditContext} from "../contextHelper";
    import {modelRecordsContextFns} from "../modelRecordsContextFns";
    import {onMount} from "svelte";
    import {modelFns} from "@cozemble/model-api";

    const expandedRecordIds = writable([] as DataRecordId[])

    export let model: Model
    export let record: DataRecord
    export let save: (record: DataRecord) => void
    export let cancel: () => void

    const errors = singleRecordEditContext.getErrorsForRecord()
    const errorVisibilityByRecordId = modelRecordsContextFns.getErrorVisibilityByRecordId()
    const focusControls = modelRecordsContextFns.getFocusControls()

    function notImplemented() {
        throw new Error("Not implemented")
    }

    function saveClicked() {
        if ($errors.size > 0) {
            errorVisibilityByRecordId.update(viz => viz.set(record.id.value, true))
        } else {
            save(record)
        }
    }

    onMount(() => {
        const firstLeaf = modelFns.leafSlots(model)[0]
        if(firstLeaf) {
            focusControls.setFocus(0, firstLeaf, [])
            focusControls.beginEditing()
        }
    })

</script>

<table class="table table-compact">
    <thead>
    <tr>
        {#each model.slots as slot, index}
            <SlotTh {slot} {index} editSlot={notImplemented} permitModelEditing={false}/>
        {/each}
    </tr>
    </thead>
    <tbody>
    <DataEntryRow parentPath={[]}
                  options={dataRecordsTableOptions(false, false, false)}
                  {record}
                  rowIndex={0}
                  oneOnly={true}
                  {expandedRecordIds}/>
    </tbody>
</table>
<div class="mt-4">
    <button class="btn btn-primary save" on:click={saveClicked}>Save new {model.name.value}</button>
    <button class="btn btn-secondary ml-2 cancel" on:click={cancel}>Cancel</button>
</div>
