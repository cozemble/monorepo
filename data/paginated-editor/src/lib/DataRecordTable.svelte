<script lang="ts">
    import type {DataRecordPathFocus} from './DataRecordPathFocus'
    import type {DataRecord, DataRecordPath, DataRecordPathElement, Model,} from '@cozemble/model-core'
    import type {Writable} from 'svelte/store'
    import {dataRecordTableClicked} from './dataRecordTableClicked'
    import DataRecordTableTd from './DataRecordTableTd.svelte'

    export let model: Model
    export let record: DataRecord
    export let parentPath: DataRecordPathElement[]
    export let errors: Map<DataRecordPath, string[]>
    export let focus: Writable<DataRecordPathFocus>
    export let showErrors: boolean
</script>

<table
        on:click={(event) => dataRecordTableClicked(focus, event)}
        on:keyup={(event) => dataRecordTableClicked(focus, event)}
        class="table">
    <thead class="">
    <tr>
        {#each model.properties as property}
            <th>{property.name.value}</th>
        {/each}
    </tr>
    </thead>
    <tbody>
    <tr>
        {#each model.properties as property}
            {#if property._type === 'property'}
                <DataRecordTableTd
                        {property}
                        {record}
                        {parentPath}
                        {errors}
                        {focus}
                        {showErrors}/>
            {:else}
                <td>To do {property._type}</td>
            {/if}
        {/each}
    </tr>
    </tbody>
</table>
