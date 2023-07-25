<script lang="ts">
    import {browser} from '$app/environment';
    import { onMount } from 'svelte';

    let audio: HTMLAudioElement;
    let chunks: BlobPart[] = [];
    let mediaRecorder: MediaRecorder;
    let audioURL: string | undefined;
    let audioBlob: Blob | undefined;
    let recordButtonLabel = "Start Recording";
    let isRecording = false;
    let transcription: string | null = null

    const handleRecord = async () => {
        if (!isRecording) {
            isRecording = true;
            transcription = null
            recordButtonLabel = "Stop Recording";

            if (!navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia not supported on your browser!');
            }

            const stream: MediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.start();

            mediaRecorder.ondataavailable = (e: BlobEvent) => {
                chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob: Blob = new Blob(chunks, { 'type' : mediaRecorder.mimeType });
                chunks = [];
                audioURL = window.URL.createObjectURL(blob);
                audio.src = audioURL;
                audioBlob = blob;
                handleTranscribe()
            };
        } else {
            isRecording = false;
            recordButtonLabel = "Start Recording";
            mediaRecorder.stop();
        }
    };

    const handlePlay = () => {
        audio.play();
    };

    const handleTranscribe = async () => {
        if (!audioBlob) {
            console.error('No audio recorded');
            return;
        }

        const data = new FormData();
        data.append('audio', audioBlob);
        data.append('mimeType', mediaRecorder.mimeType);

        try {
            const response = await fetch('/speech2', {
                method: 'POST',
                body: data,
            });

            const result = await response.json();
            console.log(result);
            transcription = result.text
        } catch (error) {
            console.error('Failed to transcribe audio:', error);
        }
    };

    onMount(() => {
        if(browser) {
            audio = new Audio()
        }
    })
</script>

<main>
    <button on:click={handleRecord}>{recordButtonLabel}</button>
    <button on:click={handlePlay} disabled={!audioURL}>Play</button>
    <button on:click={handleTranscribe} disabled={!audioBlob}>Transcribe</button>
</main>

{#if transcription}
    <p>{transcription}</p>
{/if}
