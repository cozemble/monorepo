<script lang="ts">
import { selectedModel } from '$lib/stores/models'

let modelInput: string = ''

$: if (!!modelInput) {
  selectedModel.set(JSON.parse(modelInput))
}
</script>

<div class="flex flex-col gap-4 bg-base-300 p-4">
  <h1>Provide a model (optional)</h1>
  <textarea cols="30" rows="10" class="textarea" bind:value={modelInput} />
  <a class="btn btn-primary" href="editor">Save And View</a>
</div>
