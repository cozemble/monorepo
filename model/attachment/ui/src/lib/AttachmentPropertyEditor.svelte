<script lang="ts">
    import type {DataRecord, DataRecordPath} from '@cozemble/model-core'
    import {dataRecordEditor} from "@cozemble/data-editor-sdk";

    export let recordPath: DataRecordPath
    export let record: DataRecord

    const dataRecordEditorClient = dataRecordEditor.getClient()

    function uploadProgressUpdate(percentage: number) {
        console.log("Upload progress:", percentage)
    }

    async function handleFileSelect(event: Event) {
        const target = event.target as HTMLInputElement
        const fileList = target.files;
        if(!fileList || fileList.length === 0) {
            return;
        }
        const uploaded = await dataRecordEditorClient.uploadAttachments(Array.from(fileList), uploadProgressUpdate)
        console.log({files: fileList, uploaded})
    }
</script>

<input type="file" accept="*/*" class="file-input file-input-bordered file-input-xs w-full max-w-xs" on:change={handleFileSelect}/>