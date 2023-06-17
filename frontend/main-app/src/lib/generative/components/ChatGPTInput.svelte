<script>
    import { createEventDispatcher } from 'svelte'

    const dispatch = createEventDispatcher()

    let prompt = ''
    const handlePrompt = () => {
        dispatch('handle-prompt', prompt)
    }
</script>

<div class="mb-4">
    <textarea bind:value={prompt} class="textarea textarea-xs w-full max-w-xs" placeholder="Enter Prompt"></textarea>
    <button on:click={handlePrompt} class="bg-blue-500 hover:bg-blue-700 text-white rounded font-bold py-2 mt-2 px-4 mt-5">
        Generate Code
    </button>
</div>