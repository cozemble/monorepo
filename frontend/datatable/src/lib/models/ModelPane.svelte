<script lang="ts">
    import {modelIdFns} from "@cozemble/model-api";
    import DataRecordsTableInContext from "../records/DataRecordsTableInContext.svelte";
    import ModelPaneContext from "../records/ModelRecordsContext.svelte"
    import {recordFilteringComponentStore} from "../stores/recordFilteringComponentStore";
    import {clickOutside} from "@cozemble/ui-atoms";
    import type {DataTableFocusControls2} from "../focus/DataTableFocus";
    import {contextHelper} from "../stores/contextHelper";
    import {afterUpdate} from "svelte";
    import ModelDevConsole from "./ModelDevConsole.svelte";

    export let modelId: string
    const showDevConsole = contextHelper.getShowDevConsole()

    function clickedOutsideTable(focusControls: DataTableFocusControls2) {
        focusControls.clearFocus()
    }

    afterUpdate(() => console.log({showDevConsole: $showDevConsole}))
</script>

<div class="mt-2">
    <ModelPaneContext modelId={modelIdFns.newInstance(modelId)} let:focusControls>
        <div class="grid-container">
            <div>
                <div class="child">
                    {#if $recordFilteringComponentStore}
                        <svelte:component this={$recordFilteringComponentStore}/>
                    {/if}
                </div>
            </div>
            <div use:clickOutside
                 on:click_outside={() => clickedOutsideTable(focusControls)}>
                <DataRecordsTableInContext/>
            </div>
        </div>
        {#if $showDevConsole}
            <div class="mt-4">
                <ModelDevConsole/>
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
