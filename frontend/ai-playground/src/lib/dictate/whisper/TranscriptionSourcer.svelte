<script lang="ts">
    import {createEventDispatcher} from 'svelte';
    import UploadImage from "$lib/dictate/whisper/UploadImage.svelte";

    let chunks: BlobPart[] = [];
    let mediaRecorder: MediaRecorder;
    let recordButtonLabel = "Record";
    let isRecording = false;
    let uploadImage = false
    let uploadWebsite = false
    let websiteUrl:string|null = null

    const dispatch = createEventDispatcher();

    const handleRecord = async () => {
        if (!isRecording) {
            isRecording = true;
            recordButtonLabel = "Stop";

            if (!navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia not supported on your browser!');
            }

            const stream: MediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.start();

            mediaRecorder.ondataavailable = (e: BlobEvent) => {
                chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob: Blob = new Blob(chunks, {'type': mediaRecorder.mimeType});
                chunks = [];
                dispatch('recording', blob)
            };
        } else {
            isRecording = false;
            recordButtonLabel = "Record";
            mediaRecorder.stop();
        }
    };

    function handleImage() {
        uploadImage = true
    }

    function onUpload(event: CustomEvent<File>) {
        dispatch('image', event.detail)
        console.log('Dispatched image')
    }

    function onUploadCancel() {
        uploadImage = false
    }

    function handleWebsite() {
        uploadWebsite = true
    }

    function websiteUrlKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            dispatch('website', websiteUrl)
            uploadWebsite = false
            websiteUrl = null
        }
    }

    function focus(element: HTMLInputElement) {
        element.focus()
    }

</script>

<div class="flex mx-auto">
    {#if uploadImage}
        <UploadImage on:upload={onUpload} on:cancel={onUploadCancel}/>
    {:else if uploadWebsite}
        <input type="text" class="input input-bordered form-control" placeholder="Website URL" bind:value={websiteUrl} on:keydown={websiteUrlKeydown} use:focus/>
    {:else}
        <button class="btn btn-primary" on:click={handleRecord}>{recordButtonLabel}</button>
        <button class="btn btn-primary ml-2" on:click={handleImage} disabled={isRecording}>Photo</button>
        <button class="btn btn-primary ml-2" on:click={handleWebsite} disabled={isRecording}>Website</button>
    {/if}
</div>
