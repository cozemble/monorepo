<script lang="ts">
import { modelIdFns } from '@cozemble/model-api'
import { clickOutside } from '@cozemble/ui-atoms'

// misc <!-- TODO simplify -->
import type { DataTableFocusControls2 } from '../../focus/DataTableFocus'
// stores
import { recordFilteringComponentStore } from '../../stores/recordFilteringComponentStore'
import { contextHelper } from '../../stores/contextHelper'
// components
import ModelPaneContext from './ModelRecordsContext.svelte'
import ModelDevConsole from '../../models/ModelDevConsole.svelte'
import RecordEditor from './RecordEditor.svelte'

export let modelId: string
const showDevConsole = contextHelper.getShowDevConsole()

// <!-- TODO understand this -->
function clickedOutsideTable(focusControls: DataTableFocusControls2) {
  focusControls.clearFocus()
}
</script>

<div class="mt-2">
  <ModelPaneContext modelId={modelIdFns.newInstance(modelId)} let:focusControls>
    <div class="grid-container">
      <div>
        <div class="child">
          {#if $recordFilteringComponentStore}
            <svelte:component this={$recordFilteringComponentStore} />
          {/if}
        </div>
      </div>

      <div
        use:clickOutside
        on:click_outside={() => clickedOutsideTable(focusControls)}
      >
        <RecordEditor />
      </div>
    </div>

    {#if $showDevConsole}
      <div class="mt-4">
        <ModelDevConsole />
      </div>
    {/if}
  </ModelPaneContext>
</div>

<style>
.grid-container {
  display: grid;
  grid-template-columns: max-content;
  width: max-content;
}

.child {
  display: flex;
  justify-content: space-between;
}
</style>
