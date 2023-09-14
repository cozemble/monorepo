<script lang="ts">
    import {useCompletion} from 'ai/svelte';
    import {createEventDispatcher, onMount} from 'svelte';

    export let html: string

    const {input, handleSubmit, completion, isLoading} = useCompletion({
        api: '/genai/stream/jsonSchemaFromHtml',
    });
    let generateJsonSchemaFromHtmlButton: HTMLButtonElement
    const dispatch = createEventDispatcher()

    function onLoadingChange(isLoading: boolean | undefined, generated: string) {
        if (generated.trim().length === 0) {
            return
        }
        if (isLoading === false) {
            dispatch('generated', $completion)
        }
    }

    function dispatchPartials(generated: string) {
        console.log({generated})
        if (generated.trim().length === 0) {
            return
        }
        dispatch('partial', generated)
    }

    $: onLoadingChange($isLoading, $completion)
    $: dispatchPartials($completion)

    onMount(() => {
        $input = html
        generateJsonSchemaFromHtmlButton.click()
    })
</script>

<!--<h1 class="text-center">Creating initial version of output JSON Schema</h1>-->
<!--<p class="text-center"><em>We're using GPT 4 to 'guess' a JSON Schema from the document, because 3.5 is no good at this task.</em></p>-->
<!--<p class="text-center"><em>It can take a long time if the document is complex</em></p>-->
<!--<p class="text-center"><em>You will get the option to edit the schema, this is just a starting point.</em></p>-->

<!--<pre>{$completion}</pre>-->

<form on:submit={handleSubmit} class="hidden">
    <button type="submit" class="btn btn-primary mt-2" bind:this={generateJsonSchemaFromHtmlButton}>Generate</button>
</form>

<style>
    .hidden {
        display: none;
    }
</style>