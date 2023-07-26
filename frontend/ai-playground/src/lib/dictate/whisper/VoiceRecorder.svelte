<script lang="ts">
    import {createEventDispatcher} from 'svelte';
    import UploadImage from "$lib/dictate/whisper/UploadImage.svelte";

    let chunks: BlobPart[] = [];
    let mediaRecorder: MediaRecorder;
    let recordButtonLabel = "Record";
    let isRecording = false;
    let uploadImage = false

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

    function onUpload(event:CustomEvent<File>) {
        console.log("onUpload", event)
        dispatch('image', event.detail)
        uploadImage = false
        console.log('Dispatched image')
    }

    function onUploadCancel() {
        uploadImage = false
    }

</script>

<div class="flex mx-auto">
    {#if uploadImage}
        <UploadImage on:upload={onUpload} on:cancel={onUploadCancel}/>
    {:else}
        <button class="btn btn-primary" on:click={handleRecord}>{recordButtonLabel}</button>
        <button class="btn btn-primary ml-2" on:click={handleImage} disabled={isRecording}>Photo</button>
    {/if}
</div>
