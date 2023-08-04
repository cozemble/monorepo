<script lang="ts">
    import {browser} from '$app/environment';
    import {writable} from 'svelte/store'
    import {customerSchema} from "./schemas";
    import {Debouncer} from "@cozemble/lang-util";
    import {convertTextToJson} from "$lib/dictate/convertTextToJson";

    let recognition: any | undefined;
    let listening = false;
    const transcript = writable('')
    const jsonObject = writable(null as null | any)

    if (browser && 'webkitSpeechRecognition' in window) {
        recognition = new (window.webkitSpeechRecognition as any)();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event: any) => {
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
        if ($transcript.trim().length === 0) {
            jsonObject.set(null)
        } else {
            convertTextToJson(customerSchema, $transcript, $jsonObject).then(json => {
                jsonObject.set(JSON.parse(json.result))
            })
        }
    }

    const debouncer = new Debouncer(handleText, 500)

    transcript.subscribe(() => {
        debouncer.debounce()
    })

</script>

<main>
    <button on:click={toggleListening}>
        {listening ? 'Stop Listening' : 'Start Listening'}
    </button>
    <textarea readonly>{$transcript}</textarea>
</main>

<h3>Data</h3>
<textarea rows="40" class="input input-bordered h-full">{JSON.stringify($jsonObject, null, 2)}</textarea>

<h3>Schema</h3>
<textarea rows="40" class="input input-bordered h-full">{JSON.stringify(customerSchema, null, 2)}</textarea>
