<script lang="ts">
    import {onMount} from "svelte";

    export let s3PdfKey: string

    let imgElement: HTMLImageElement
    let attempts = 0
    let maxAttempts = 30
    let imageLoaded = false


    async function fetchImage(s3key: string) {
        await fetch(`/api/get-image?s3key=${s3key}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response;
            })
            .then(response => response.blob()) // Convert the data to a blob
            .then(blob => {
                const imageUrl = URL.createObjectURL(blob); // Create an Object URL from the blob
                imgElement.src = imageUrl; // Set the Object URL as the img src
                imageLoaded = true
            })
            .catch((error: any) => {
                attempts++
                if (attempts < maxAttempts) {
                    setTimeout(() => {
                        console.log(`retrying to fetch image ${s3key}, attempt ${attempts}`)
                        return fetchImage(s3key);
                    }, 1000)
                } else {
                    console.log('error', error)
                }
            });
    }

    onMount(() => {
        const pngKey = s3PdfKey.replace('.pdf', '.png')
        fetchImage(pngKey)
    })
</script>

<img bind:this={imgElement} class="border p-4 page-preview"/>
{#if !imageLoaded}
    <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
    </div>
{/if}
<style>
    .page-preview {
        max-width: 600px;
        min-width: 600px;
    }
</style>