<script lang="ts">
    import {svelte} from '@cozemble/vercel-ai';
    import {createEventDispatcher, onMount} from 'svelte';

    export let html: string
    export let schema: string

    const {input, handleSubmit, completion, isLoading} = svelte.useCompletion({
        api: '/genai/stream/jsonFromHtml',
    });
    let generateJsonFromHtmlButton: HTMLButtonElement
    const dispatch = createEventDispatcher()

    onMount(() => {
        $input = JSON.stringify({html,schema})
        generateJsonFromHtmlButton.click()
    })

    function onLoadingChange(isLoading: boolean | undefined, generated: string) {
        if (generated.trim().length === 0) {
            return
        }
        if (isLoading === false) {
            dispatch('generated', $completion)
        }
    }

    function dispatchPartials(generated: string) {
        if (generated.trim().length === 0) {
            return
        }
        dispatch('partial', generated)
    }

    $: onLoadingChange($isLoading, $completion)
    $: dispatchPartials($completion)
</script>

<form on:submit={handleSubmit} class="hidden">
    <button type="submit" class="btn btn-primary mt-2" bind:this={generateJsonFromHtmlButton}>Generate</button>
</form>

<style>
    .hidden {
        display: none;
    }
</style>