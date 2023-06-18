<script>
  import {createEventDispatcher} from 'svelte'

  const dispatch = createEventDispatcher()

  let prompt = ''
  const handlePrompt = () => {
    dispatch('handle-prompt', prompt)
  }
</script>

<div class="flex flex-col ml-5 mr-5 w-1/2">
    <textarea bind:value={prompt} class="input-bordered textarea" rows="10" placeholder="Enter Prompt"></textarea>
    <div>
        <button on:click={handlePrompt}
                class="bg-blue-500 hover:bg-blue-700 text-white rounded font-bold py-2 px-4 mt-5">
            Generate Code
        </button>
    </div>
</div>