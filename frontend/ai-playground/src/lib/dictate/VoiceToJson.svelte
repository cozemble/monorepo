<script lang="ts">
    import {browser} from '$app/environment';
    import {writable} from 'svelte/store'
    import {Debouncer} from "@cozemble/lang-util";
    import {convertTextToJson} from "./convertTextToJson.js";
    import type {JsonSchema} from "@cozemble/model-core";

    export let schema: JsonSchema
    export let jsonObject = writable(null as null | any)
    export let transcript = writable('')

    let recognition: any | undefined;
    let listening = false;

    if (browser && 'webkitSpeechRecognition' in window) {
        recognition = new (window.webkitSpeechRecognition as any)();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event: any) => {
            console.log('onresult', event)
            transcript.set('')
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    transcript.set(event.results[i][0].transcript)
                    break
                } else {
                    transcript.update(ts => ts + event.results[i][0].transcript)
                }
            }
        };
    } else {
        console.error('Web Speech API is not supported by this browser.');
    }

    function toggleListening(): void {
        if (listening) {
            recognition?.stop();
            listening = false;
        } else {
            recognition?.start();
            listening = true;
        }
    }

    async function handleText() {
        console.log('handleText', $transcript)
        if ($transcript.trim().length === 0) {
            jsonObject.set(null)
        } else {
            convertTextToJson(schema, $transcript, $jsonObject).then(json => {
                jsonObject.set(JSON.parse(json.result))
            })
        }
    }

    const debouncer = new Debouncer(handleText, 500)

    transcript.subscribe(() => {
        debouncer.debounce()
    })

</script>

<button class="btn btn-primary" on:click={toggleListening}>
    {listening ? 'Stop Dictation' : 'Start Dictation'}
</button>
<textarea readonly>{$transcript}</textarea>

