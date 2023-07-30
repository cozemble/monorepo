<script lang="ts">
    import {editorExtensions} from "@cozemble/frontend-datatable";
    import {singleRecordEditContext} from "@cozemble/frontend-datatable";
    import {modelRecordsContextFns} from "@cozemble/frontend-datatable";
    import WhisperDictationPage from "$lib/dictate/whisper/WhisperDictationPage.svelte";

    const switchableModelPane = editorExtensions.getSwitchableModelPane()
    const rootRecordId = singleRecordEditContext.getRootRecordId()
    const records = modelRecordsContextFns.getRecords()
    const recordGraph = modelRecordsContextFns.getEventSourcedRecordGraph()

    function showDictation() {
        switchableModelPane.set({component: WhisperDictationPage, props: {rootRecordId, records, recordGraph}})
    }

</script>

<button class="btn btn-ghost btn-active btn-sm  mr-2" on:click={showDictation}>
    Dictate
</button>

