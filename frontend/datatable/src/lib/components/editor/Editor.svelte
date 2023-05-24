<script lang="ts">
import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'

import ModelPane from '$lib/models/ModelPane.svelte'
import RecordCreatorContext from '$lib/records/creator/RecordCreatorContext.svelte'
import Modals from '$lib/Modals.svelte'
import EditorNav from '$lib/components/editor/nav/EditorNav.svelte'

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
