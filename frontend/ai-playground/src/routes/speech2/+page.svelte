<script lang="ts">
    import TranscriptionSourcer from "$lib/dictate/whisper/TranscriptionSourcer.svelte";
    import VoiceNote from "$lib/dictate/whisper/VoiceNote.svelte";
    import type {TranscriptionSource} from "$lib/dictate/whisper/TranscribedAudio.js";
    import ImageNote from "$lib/dictate/whisper/ImageNote.svelte";
    import WebsiteNote from "$lib/dictate/whisper/WebsiteNote.svelte";

    let transcriptions: TranscriptionSource[] = []
    let fullText = "";

    function onTranscribed() {
        fullText = transcriptions.map(vn => vn.transcription ?? "").join(" ");
    }

    function onRecording(event: CustomEvent<Blob>) {
        const blob = event.detail;
        transcriptions = [...transcriptions, {_type: "transcribed.audio", audio: blob, transcription: null}]
    }

    function onImage(event: CustomEvent<File>) {
        const image = event.detail;
        transcriptions = [...transcriptions, {_type: "transcribed.image", image, transcription: null}]
    }

    function onWebsite(event: CustomEvent<string>) {
        const url = event.detail;
        transcriptions = [...transcriptions, {_type: "transcribed.website", url, image: null, transcription: null}]
    }
</script>

<TranscriptionSourcer on:recording={onRecording} on:image={onImage} on:website={onWebsite}/>

{#each transcriptions as transcription}
    {#if transcription._type === 'transcribed.audio'}
        <VoiceNote voiceNote={transcription} on:transcribed={onTranscribed}/>
    {/if}
    {#if transcription._type === 'transcribed.image'}
        <ImageNote image={transcription} on:transcribed={onTranscribed}/>
    {/if}
    {#if transcription._type === 'transcribed.website'}
        <WebsiteNote site={transcription} on:transcribed={onTranscribed}/>
    {/if}
{/each}

<p class="mt-2">
    {fullText}
</p>