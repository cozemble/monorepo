<script lang="ts">
    import type {TranscribedWebsite} from "$lib/dictate/whisper/TranscribedAudio.js";
    import {createEventDispatcher, onMount} from "svelte";


    export let site: TranscribedWebsite

    const dispatch = createEventDispatcher()

    function changed() {
        dispatch("transcribed")
    }

    const handleTranscribe = async () => {
        try {
            const response = await fetch('/website', {
                method: 'POST',
                body: JSON.stringify({url: site.url})
            });

            const result = await response.json();
            console.log({result})
            site.transcription = result.text
            dispatch("transcribed")
        } catch (error) {
            console.error('Failed to transcribe audio:', error);
        }
    };

    onMount(() => {
        if (site.transcription === null) {
            handleTranscribe()
        }
    })
</script>

<div class="flex mt-2 items-center">
    <div title={site.url}>Website</div>
    {#if site.transcription}
        <textarea class="input input-bordered w-full" bind:value={site.transcription} on:change={changed}/>
    {:else}
        <div class="loading"/>
    {/if}
</div>