<!-- TODO (refactor): move into '$lib/components/Editor.svelte' -->
<script lang="ts">
import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'

import ModelPane from './models/ModelPane.svelte'
import RecordCreatorContext from './records/creator/RecordCreatorContext.svelte'
import Modals from './Modals.svelte'
import EditorNav from './components/editor/EditorNav.svelte'

export let navbarState: Writable<string | null> = writable(null)

//
</script>

<EditorNav {navbarState} />

{#if $navbarState}
  {#key $navbarState}
    <RecordCreatorContext>
      <ModelPane modelId={$navbarState} />
    </RecordCreatorContext>
  {/key}
{/if}

<Modals />
