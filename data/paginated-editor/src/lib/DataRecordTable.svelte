<script lang="ts">
    import type {DataRecordPathFocus} from './DataRecordPathFocus'
    import type {DataRecord, DataRecordValuePath, DataRecordPathParentElement, Model,} from '@cozemble/model-core'
    import type {Writable} from 'svelte/store'
    import {dataRecordTableClicked} from './dataRecordTableClicked'
    import DataRecordTableTd from './DataRecordTableTd.svelte'
    import type {SystemConfiguration} from "@cozemble/model-core";

    export let model: Model
    export let record: DataRecord
    export let parentPath: DataRecordPathParentElement[]
    export let errors: Map<DataRecordValuePath, string[]>
    export let focus: Writable<DataRecordPathFocus>
    export let showErrors: boolean
    export let systemConfiguration: SystemConfiguration
</script>

<table
        on:click={(event) => dataRecordTableClicked(focus, event)}
        on:keyup={(event) => dataRecordTableClicked(focus, event)}
        class="table">
    <thead class="">
    <tr>
        {#each model.slots as slot}
            <th>{slot.name.value}</th>
        {/each}
    </tr>
    </thead>
    <tbody>
    <tr>
        {#each model.slots as modelSlot}
            {#if modelSlot._type === 'property' || modelSlot._type === 'model.reference'}
                <DataRecordTableTd
                        {systemConfiguration}
                        {modelSlot}
                        {record}
                        {parentPath}
                        {errors}
                        {focus}
                        {showErrors}/>
            {:else}
                <td>To do {modelSlot._type}</td>
            {/if}
        {/each}
    </tr>
    </tbody>
</table>
