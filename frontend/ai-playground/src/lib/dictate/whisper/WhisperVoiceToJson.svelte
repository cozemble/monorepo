<script lang="ts">
    import {writable} from 'svelte/store'
    import type {JsonSchema} from "@cozemble/model-core";
    import VoiceRecorder from "$lib/dictate/whisper/VoiceRecorder.svelte";
    import VoiceNote from "$lib/dictate/whisper/VoiceNote.svelte";
    import type {TranscriptionSource} from "$lib/dictate/whisper/TranscribedAudio";
    import {convertTextToJson} from "$lib/dictate/convertTextToJson";
    import ImageNote from "$lib/dictate/whisper/ImageNote.svelte";

    export let schema: JsonSchema
    export let jsonObject = writable(null as null | any)
    export let transcript = writable('')

    let transcriptions: TranscriptionSource[] = []

    function onTranscribed() {
        const fullText = transcriptions.map(vn => vn.transcription ?? "").join(" ");
        transcript.set(fullText)
        handleText()
    }

    function onRecording(event: CustomEvent<Blob>) {
        const blob = event.detail;
        transcriptions = [...transcriptions, {_type: "transcribed.audio", audio: blob, transcription: null}]
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

    function onImage(event: CustomEvent<File>) {
        const image = event.detail
        transcriptions = [...transcriptions, {_type: "transcribed.image", image, transcription: null}]
    }
</script>

<VoiceRecorder on:recording={onRecording} on:image={onImage}/>

{#each transcriptions as transcription}
    {#if transcription._type === "transcribed.audio"}
        <VoiceNote voiceNote={transcription} on:transcribed={onTranscribed}/>
    {/if}
    {#if transcription._type === 'transcribed.image'}
        <ImageNote image={transcription} on:transcribed={onTranscribed}/>
    {/if}
{/each}
