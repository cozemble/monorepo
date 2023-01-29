<script lang="ts">
import { selectedModel } from '$lib/stores/models'

import ObjectEditor from '$lib/components/ObjectEditor.svelte'

console.log('selectedModel', $selectedModel)
</script>

{#if $selectedModel?.properties}
  <ObjectEditor properties={$selectedModel.properties} />
{:else}
  <div class="flex flex-col items-center justify-center h-full">
    <h1 class="text-4xl text-gray-500">No model selected</h1>
  </div>
{/if}
