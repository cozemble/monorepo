<script lang="ts">
    import {modelIdFns} from "@cozemble/model-core";
    import DataRecordsTableInContext from "../records/DataRecordsTableInContext.svelte";
    import ModelRecordsContext from "../records/ModelRecordsContext.svelte"
    import {recordFilteringComponentStore} from "../stores/recordFilteringComponentStore";
    import {clickOutsideWhenVisible} from "@cozemble/ui-atoms";
    import type {DataTableFocusControls2} from "../focus/DataTableFocus";
    import {contextHelper} from "../stores/contextHelper";
    import ModelDevConsole from "./ModelDevConsole.svelte";

    export let modelId: string
    const showDevConsole = contextHelper.getShowDevConsole()
    let container: HTMLDivElement


    function clickedOutsideTable(focusControls: DataTableFocusControls2) {
        focusControls.clearFocus()
    }
</script>

<div class="mt-2" bind:this={container}>
    <ModelRecordsContext modelId={modelIdFns.newInstance(modelId)} let:focusControls>
        <div class="grid-container">
            <div>
                <div class="child">
                    {#if $recordFilteringComponentStore}
                        <svelte:component this={$recordFilteringComponentStore}/>
                    {/if}
                </div>
            </div>
            <div use:clickOutsideWhenVisible
                 on:click_outside={() => clickedOutsideTable(focusControls)}>
                <DataRecordsTableInContext/>
            </div>
        </div>
        {#if $showDevConsole}
            <div class="mt-4">
                <ModelDevConsole/>
            </div>
        {/if}
    </ModelRecordsContext>
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
