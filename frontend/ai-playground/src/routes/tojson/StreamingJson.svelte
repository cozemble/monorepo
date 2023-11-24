<script lang="ts">
    import {useCompletion} from 'ai/svelte';
    import {onMount, createEventDispatcher} from "svelte";
    import {derived} from "svelte/store";

    export let api: string
    export let body: any
    let submitButton: HTMLButtonElement
    const dispatch = createEventDispatcher()
    let jsonContainerDiv: HTMLDivElement

    const {input, handleSubmit, completion, isLoading} = useCompletion({
        api
    });

    const processedCompletion = derived(completion, $completion => {
        if ($completion.trim().length === 0) {
            return ''
        }
        $completion = $completion.replace(/^```json/g, '').replace(/```$/g, '')
        try {
            return JSON.stringify(JSON.parse($completion), null, 2)
        } catch (e) {
            return $completion
        }
    })

    onMount(() => {
        $input = JSON.stringify({...body, stream: true})
        submitButton.click()
    })

    function onLoadingChange(isLoading: boolean | undefined, generated: string) {
        if (generated.trim().length === 0) {
            return
        }
        if (isLoading === false) {
            const final = $completion.replace(/```json/g, '').replace(/```/g, '')
            dispatch('completion', final)
        }
    }

    function dispatchPartials(generated: string) {
        if (generated.trim().length === 0) {
            return
        }
        dispatch('partial', generated)
        jsonContainerDiv.scrollTop = jsonContainerDiv.scrollHeight
    }

    $: onLoadingChange($isLoading, $completion)
    $: dispatchPartials($completion)

</script>

<!-- 
    @component
    Sends request to the given api and displays the response with chat like streaming
    - `on:partial`: Dispatched when a partial response is received
    - `on:completion`: Dispatched when the request is complete
 -->

 <!-- Using a hidden form to send the request -->
<form on:submit={handleSubmit} class="hidden">
    <button type="submit" bind:this={submitButton}>Generate</button>
</form>
<div class="border rounded p-4 overflow-y-auto" bind:this={jsonContainerDiv}>
<pre>{$processedCompletion}</pre>
</div>