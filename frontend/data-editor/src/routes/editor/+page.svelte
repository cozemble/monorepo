<script lang="ts">
import { selectedModel } from '$lib/stores/models'

import StackingEditor from '$lib/components/StackingEditor.svelte'

console.log('selectedModel', $selectedModel)
</script>

<StackingEditor properties={$selectedModel.properties} />
