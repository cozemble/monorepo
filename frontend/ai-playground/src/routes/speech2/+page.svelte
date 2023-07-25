<script lang="ts">
    import VoiceRecorder from "$lib/dictate/whisper/VoiceRecorder.svelte";
    import type {TranscribedAudio} from "$lib/dictate/whisper/TranscribedAudio";
    import VoiceNote from "$lib/dictate/whisper/VoiceNote.svelte";

    let voiceNotes:TranscribedAudio[] = []
    let fullText = "";


    function onTranscribed() {
        fullText = voiceNotes.map(vn => vn.transcription ?? "").join(" ");
    }

    function onRecording(event:CustomEvent<Blob>) {
        const blob = event.detail;
        voiceNotes = [...voiceNotes, {audio: blob, transcription: null}]
    }

</script>

<VoiceRecorder on:recording={onRecording} />

{#each voiceNotes as voiceNote}
    <VoiceNote {voiceNote} on:transcribed={onTranscribed}/>
{/each}

<p class="mt-2">
    {fullText}
</p>