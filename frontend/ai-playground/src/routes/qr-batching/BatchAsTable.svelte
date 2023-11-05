<script lang="ts">
    import {type BatchInstance, flattenBatchInstance, groupByLocation, orderedLocations} from "./types";
    import {mandatory} from "@cozemble/lang-util";
    import {afterUpdate} from "svelte";

    export let currentBatchInstance: BatchInstance
    const locations = orderedLocations(currentBatchInstance.type)
    $: batchInstanceLines = groupByLocation(flattenBatchInstance(currentBatchInstance))

    afterUpdate(() => console.log({batchInstanceLines, currentBatchInstance}))
</script>

<table class="table">
    <thead>
    <tr>
        <th>Location</th>
        <th>MAC</th>
        <th>Sensor Type</th>
    </tr>
    </thead>
    <tbody>
    {#each locations as location}
        {@const lines = mandatory(batchInstanceLines.get(location), "lines")}
        {#each lines as line, lineIndex}
            <tr>
                <td>
                    {#if lineIndex === 0}
                        {location.name}
                    {/if}
                </td>
                <td>{line.scannedSensor?.scan.code ?? ""}</td>
                <td>{line.sensorType.name}</td>
            </tr>
        {/each}
    {/each}
    </tbody>
</table>