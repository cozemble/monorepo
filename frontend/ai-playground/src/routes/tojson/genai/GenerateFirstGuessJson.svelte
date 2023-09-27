<script lang="ts">
    import {useCompletion} from 'ai/svelte';
    import {createEventDispatcher, onMount} from 'svelte';

    export let html: string

    const {input, handleSubmit, completion, isLoading} = useCompletion({
        api: '/genai/stream/jsonFromOnlyHtml',
    });
    let generateButton: HTMLButtonElement
    const dispatch = createEventDispatcher()

    onMount(() => {
        $input = JSON.stringify({html})
        generateButton.click()
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
    <button type="submit" class="btn btn-primary mt-2" bind:this={generateButton}>Generate</button>
</form>

<style>
    .hidden {
        display: none;
    }
</style>