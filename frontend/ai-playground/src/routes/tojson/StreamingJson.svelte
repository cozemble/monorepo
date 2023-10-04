<script lang="ts">
    import {useCompletion} from 'ai/svelte';
    import {onMount, createEventDispatcher} from "svelte";


    export let api: string
    export let body: any
    let submitButton: HTMLButtonElement
    const dispatch = createEventDispatcher()

    const {input, handleSubmit, completion, isLoading} = useCompletion({
        api
    });

    onMount(() => {
        $input = JSON.stringify({...body, stream: true})
        submitButton.click()
    })

    function onLoadingChange(isLoading: boolean | undefined, generated: string) {
        if (generated.trim().length === 0) {
            return
        }
        if (isLoading === false) {
            dispatch('completion', $completion)
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
    <button type="submit" bind:this={submitButton}>Generate</button>
</form>
<pre class="border p-8">{$completion}</pre>