<script lang="ts">
    import { writable } from 'svelte/store';
    type State = {
        url: string;
        selectors: string;
        screenshot: string | null;
        error: string | null;
    };

    let state = writable({
        url: '',
        selectors: '',
        screenshot: null,
        error: null
    } as State);

    const captureScreenshot = async () => {
        try {
            const response = await fetch('/screenshot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: $state.url,
                    selectors: $state.selectors.split(',').map(s => s.trim())
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            $state.screenshot = URL.createObjectURL(blob);
            $state.error = null;
        } catch (error:any) {
            $state.error = error.message;
            $state.screenshot = null;
        }
    };
</script>

<div>
    <h1>Website Screenshot Generator</h1>
    <form on:submit|preventDefault={captureScreenshot}>
        <label for="url">Website URL:</label>
        <input type="url" id="url" bind:value={$state.url} required />

        <label for="selectors">DOM Selectors to Remove:</label>
        <input type="text" id="selectors" bind:value={$state.selectors} placeholder=".selector1, .selector2, ..." />

        <button type="submit">Capture Screenshot</button>
    </form>

    {#if $state.screenshot}
        <img src={$state.screenshot} alt="Website Screenshot" />
    {/if}

    {#if $state.error}
        <p>Error: {$state.error}</p>
    {/if}
</div>
