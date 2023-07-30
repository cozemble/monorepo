<script lang="ts">
    export const ssr = false;
    import type {TranscribedAudio} from "./TranscribedAudio";
    import {createEventDispatcher, onMount} from "svelte";

    export let voiceNote: TranscribedAudio
    const audio: HTMLAudioElement = new Audio()
    const dispatch = createEventDispatcher()
    const audioURL = window.URL.createObjectURL(voiceNote.audio);
    audio.src = audioURL;


    const handlePlay = () => {
        audio.play();
    };

    const handleTranscribe = async () => {
        const data = new FormData();
        data.append('audio', voiceNote.audio);
        data.append('mimeType', voiceNote.audio.type);

        try {
            const response = await fetch('/speech2', {
                method: 'POST',
                body: data,
            });

            const result = await response.json();
            voiceNote.transcription = result.text
            dispatch("transcribed")
        } catch (error) {
            console.error('Failed to transcribe audio:', error);
        }
    };

    onMount(() => {
        if (voiceNote.transcription === null) {
            handleTranscribe()
        }
    })

    function changed() {
        dispatch("transcribed")
    }
</script>

<div class="flex mt-2 items-center">
    <button class="btn btn-secondary btn-xs mr-3" on:click={handlePlay}>Play</button>
    {#if voiceNote.transcription}
        <textarea class="input input-bordered w-full"  bind:value={voiceNote.transcription} on:change={changed}/>
    {:else}
        <div class="loading"/>
    {/if}
</div>
