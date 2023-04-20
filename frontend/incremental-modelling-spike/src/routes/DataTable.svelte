<script lang="ts">
    import type {DataRecord, Model, NestedModel} from "./types";
    import {dataRecordFns, modelFns} from "./types";

    export let model: Model
    export let records: DataRecord[]
    let expandedRecordId: string | null = null

    function addField() {
        model = modelFns.addField(model, "Untitled")
    }

    function addNestedTable(record: DataRecord) {
        const elem = document.activeElement;
        if (elem) {
            elem?.blur();
        }
        model = modelFns.addNestedModel(model, "Nested Table")
        expandedRecordId = record.id
    }

    function toggleRecordExpand(record:DataRecord) {
        if (expandedRecordId === record.id) {
            expandedRecordId = null
        } else {
            expandedRecordId = record.id
        }
    }

    function ensureNestedRecord(record: DataRecord, nestedModel: NestedModel) {
        if (!record.values[nestedModel.name]) {
            record.values[nestedModel.name] = []
        }
        return record.values[nestedModel.name]
    }

    function addRecord() {
        records = [...records, dataRecordFns.newInstance()]
    }

</script>

<table class="table">
    <thead>
    <tr>
        {#each model.fields as field}
            <th>{field}</th>
        {/each}
        <td on:click={addField}>+</td>
        <td>Actions</td>
    </tr>
    </thead>
    <tbody>
    {#each records as record}
        <tr>
            {#each model.fields as field}
                <td class="border">{record.values[field] ?? ""}</td>
            {/each}
            <td class="border"></td>
            <td class="border">
                {#if model.nestedModels.length === 0}
                    <div class="dropdown">
                        <label tabindex="0" class="label m-1">...</label>
                        <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                            <li on:click={() => addNestedTable(record)}><a>Add nested table</a></li>
                        </ul>
                    </div>
                {:else}
                    <button class="btn btn-ghost btn-active" on:click={() => toggleRecordExpand(record)}>
                        {#if expandedRecordId === record.id}
                            -
                        {:else}
                            +
                        {/if}
                    </button>
                {/if}
            </td>
        </tr>
        {#if expandedRecordId === record.id}
            {#each model.nestedModels as nestedModel}
                {@const _nestedRecords = ensureNestedRecord(record, nestedModel)}
                <tr>
                    <td class="border" colspan={model.fields.length + 2}>
                        <h6>{nestedModel.name}</h6>
                        <svelte:self bind:model={nestedModel.model} bind:records={record.values[nestedModel.name]} />
                    </td>
                </tr>
            {/each}
        {/if}
    {/each}
    </tbody>
</table>

<div class="mt-2">
    <button class="btn btn-primary" on:click={addRecord}>Add record</button>
</div>