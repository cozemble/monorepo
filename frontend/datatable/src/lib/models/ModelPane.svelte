<script lang="ts">
    import {allEventSourcedModels, allModels} from "../stores/allModels";
    import {mandatory} from "@cozemble/lang-util";
    import {defaultOnError, rootRecordsContext} from "../appBackend";
    import {modelIdFns} from "@cozemble/model-api";
    import {onMount} from "svelte";
    import {systemConfiguration} from "../stores/systemConfiguration";
    import DataRecordsTableInContext from "../records/DataRecordsTableInContext.svelte";
    import ModelRecordsContext from "../records/ModelRecordsContext.svelte"
    import {recordFilteringComponentStore} from "../stores/recordFilteringComponentStore";
    import {clickOutside} from "@cozemble/ui-atoms";
    import type {DataTableFocusControls2} from "../focus/DataTableFocus";

    export let modelId: string
    const model = mandatory($allModels.find(model => model.id.value === modelId), `Model with id ${modelId} not found`)
    const context = rootRecordsContext(() => $systemConfiguration, defaultOnError, allEventSourcedModels, modelIdFns.newInstance(modelId))

    onMount(async () => {
        await context.loadRecords()
    })

    function clickedOutsideTable(focusControls: DataTableFocusControls2) {
        focusControls.clearFocus()
    }
</script>
<div class="mt-3">
    <ModelRecordsContext modelId={modelIdFns.newInstance(modelId)} let:focusControls>
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
