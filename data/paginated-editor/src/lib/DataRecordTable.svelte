<script lang="ts">
    import type {DataRecordPathFocus} from './DataRecordPathFocus'
    import type {DataRecord, DataRecordPropertyPath, DataRecordPathParentElement, Model,} from '@cozemble/model-core'
    import type {Writable} from 'svelte/store'
    import {dataRecordTableClicked} from './dataRecordTableClicked'
    import DataRecordTableTd from './DataRecordTableTd.svelte'

    export let model: Model
    export let record: DataRecord
    export let parentPath: DataRecordPathParentElement[]
    export let errors: Map<DataRecordPropertyPath, string[]>
    export let focus: Writable<DataRecordPathFocus>
    export let showErrors: boolean
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
        {#each model.slots as slot}
            {#if slot._type === 'property'}
                <DataRecordTableTd
                        property={slot}
                        {record}
                        {parentPath}
                        {errors}
                        {focus}
                        {showErrors}/>
            {:else}
                <td>To do {slot._type}</td>
            {/if}
        {/each}
    </tr>
    </tbody>
</table>
