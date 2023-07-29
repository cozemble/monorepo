<script lang="ts">
    import type {TranscribedWebsite} from "$lib/dictate/whisper/TranscribedAudio.js";
    import {createEventDispatcher, onMount} from "svelte";

    export let site: TranscribedWebsite
    $: imageUrl = site.image ? URL.createObjectURL(site.image) : null

    const dispatch = createEventDispatcher()

    function changed() {
        dispatch("transcribed")
    }

    function guessSelectors(url:string) {
        if(url.startsWith("https://www.rightmove.co.uk/properties/")) {
            return ['aside','#onetrust-consent-sdk']
        }
        return []
    }

    async function takeScreenshot() {
        const response = await fetch('/screenshot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: site.url,
                selectors: guessSelectors(site.url)
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        site.image = await response.blob()
    }

    async function doOcr() {
        if(site.image === null) {
            return
        }
        const formData = new FormData();
        formData.append('image', site.image);

        const response = await fetch('/ocr', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            site.transcription = result.text;
            dispatch("transcribed")
        } else {
            site.transcription = 'Error occurred during OCR processing.';
        }
    }

    onMount(async () => {
        if (site.image === null) {
            await takeScreenshot()
            await doOcr()
        }
    })
</script>

<div class="flex mt-2 items-center">
    {#if imageUrl}
        <img src={imageUrl} title={site.url} class="mr-3 border rounded p-1"/>
    {:else}
        <div title={site.url}>Website</div>
    {/if}
    {#if site.transcription}
        <textarea class="input input-bordered w-full" bind:value={site.transcription} on:change={changed}/>
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