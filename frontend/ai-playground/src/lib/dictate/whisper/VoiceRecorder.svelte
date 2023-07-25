<script lang="ts">
    import {createEventDispatcher} from 'svelte';

    let chunks: BlobPart[] = [];
    let mediaRecorder: MediaRecorder;
    let recordButtonLabel = "Start Recording";
    let isRecording = false;

    const dispatch = createEventDispatcher();

    const handleRecord = async () => {
        if (!isRecording) {
            isRecording = true;
            recordButtonLabel = "Stop Recording";

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
            recordButtonLabel = "Start Recording";
            mediaRecorder.stop();
        }
    };

</script>

<div class="flex">
    <button class="btn btn-primary mx-auto" on:click={handleRecord}>{recordButtonLabel}</button>
</div>
