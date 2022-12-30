<script lang="ts">
    import type {DataRecord, Model} from "@cozemble/model-core";
    import {dataRecords} from "@cozemble/model-core";

    export let model: Model
    export let records: DataRecord[]

    function deleteRecord(record: DataRecord) {

    }

    function editRecord(record: DataRecord) {

    }
    function addRecord() {
        records = [...records, dataRecords.newInstance(model,"test-user")]
    }
</script>
<table>
    <thead>
    <tr>
        {#each model.properties as property}
            <th>{property.name}</th>
        {/each}
        <th>Actions</th>
    </tr>
    </thead>
    <tbody>
    {#each records as record}
        <tr>
            {#each model.properties as property}
                <td>{record.values[property.id] ?? ""}</td>
            {/each}
            <td>
                <button on:click={() => editRecord(record.id)}>Edit</button>
                <button on:click={() => deleteRecord(record.id)}>Delete</button>
            </td>
        </tr>
    {/each}
    </tbody>
</table>
<div class="actions">
    <button on:click={addRecord}>Add record</button>
</div>

<style>
    .actions {
        margin-top: 20px;
    }

    table {
        border-collapse: collapse;
    }

    th, td {
        border: 1px solid black;
        padding: 0.5rem;
    }
</style>