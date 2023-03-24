<script lang="ts">
    import type {DataRecord, DataRecordPath} from '@cozemble/model-core'
    import {dataRecordEditor} from "@cozemble/data-editor-sdk";

    export let recordPath: DataRecordPath
    export let record: DataRecord
    let error: string | null = null

    const dataRecordEditorClient = dataRecordEditor.getClient()

    function uploadProgressUpdate(percentage: number) {
        console.log("Upload progress:", percentage)
    }

    async function handleFileSelect(event: Event) {
        const target = event.target as HTMLInputElement
        const fileList = target.files;
        if (!fileList || fileList.length === 0) {
            return;
        }
        try {
            const uploaded = await dataRecordEditorClient.uploadAttachments(Array.from(fileList), uploadProgressUpdate)
            console.log({files: fileList, uploaded})
        } catch (e:any) {
            error = e.message
        }
    }
</script>

<input type="file" accept="*/*" class="file-input file-input-bordered file-input-xs w-full max-w-xs"
       on:change={handleFileSelect}/>
{#if error}
    <div class="alert alert-error shadow-lg">
        <div>
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
        </div>
    </div>
{/if}