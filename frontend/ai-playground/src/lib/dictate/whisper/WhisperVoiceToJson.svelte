<script lang="ts">
    import {writable} from 'svelte/store'
    import type {JsonSchema} from "@cozemble/model-core";
    import VoiceRecorder from "$lib/dictate/whisper/VoiceRecorder.svelte";
    import VoiceNote from "$lib/dictate/whisper/VoiceNote.svelte";
    import type {TranscribedAudio} from "$lib/dictate/whisper/TranscribedAudio";
    import {convertTextToJson} from "$lib/dictate/convertTextToJson";

    export let schema: JsonSchema
    export let jsonObject = writable(null as null | any)
    export let transcript = writable('')

    let voiceNotes: TranscribedAudio[] = []

    function onTranscribed() {
        const fullText = voiceNotes.map(vn => vn.transcription ?? "").join(" ");
        transcript.set(fullText)
        handleText()
    }

    function onRecording(event: CustomEvent<Blob>) {
        const blob = event.detail;
        voiceNotes = [...voiceNotes, {audio: blob, transcription: null}]
    }

    async function handleText() {
        if ($transcript.trim().length === 0) {
            jsonObject.set(null)
        } else {
            convertTextToJson(schema, $transcript, {}).then(json => {
                jsonObject.set(JSON.parse(json.result))
            })
        }
    }


</script>

<VoiceRecorder on:recording={onRecording}/>

{#each voiceNotes as voiceNote}
    <VoiceNote {voiceNote} on:transcribed={onTranscribed}/>
{/each}
