<script lang="ts">
    import type {TranscribedImage} from "$lib/dictate/whisper/TranscribedAudio";
    import {createEventDispatcher, onMount} from "svelte";

    export let image: TranscribedImage

    const dispatch = createEventDispatcher()
    const url = URL.createObjectURL(image.image);

    function changed() {
        dispatch("transcribed")
    }

    const handleTranscribe = async () => {
        const data = new FormData();
        data.append('image', image.image);

        try {
            const response = await fetch('/aws-ocr', {
                method: 'POST',
                body: data,
            });

            const result = await response.json();
            image.transcription = result.html
            dispatch("transcribed")
        } catch (error) {
            console.error('Failed to transcribe audio:', error);
        }
    };

    onMount(() => {
        if (image.transcription === null) {
            handleTranscribe()
        }
    })

</script>

<div class="flex mt-2 items-center">
    <img src={url} class="mr-3 border rounded p-1"/>
    {#if image.transcription}
        <textarea class="input input-bordered w-full" bind:value={image.transcription} on:change={changed}/>
    {:else}
        <div class="loading"/>
    {/if}

</div>

<style>
    img {
        max-width: 60px;
        max-height: 60px;
    }
</style>