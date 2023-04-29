<script lang="ts">
    import {dataRecordFns, modelFns} from "./types";
    import DataTable from "./DataTable.svelte";
    import {createEventDispatcher} from "svelte";

    let model = modelFns.newInstance("Sub Item", "Sub Items")
    model = modelFns.addField(model, "Field 1")
    const records = [dataRecordFns.newInstance()]
    const dispatch = createEventDispatcher()

    function cancel() {
        dispatch('close')
    }

    function apply() {
        dispatch('apply', model)
    }
</script>


<div class="card bg-base-200 shadow-xl pt-2">
    <div class="card-body">
        <div class="tooltip tooltip-open tooltip-accent" data-tip="Preview of sub-table">
            <div class="disabled-content border border-info rounded p-2 flex flex-col items-start">
                <h6>{model.pluralName}</h6>
                <DataTable {model} {records} permitSubItemAddition={false}/>
            </div>
        </div>
        <div class="alert alert-info flex flex-col  items-start">
            <div>This is a preview of how your sub-table will look</div>
            <div>Use sub-tables to structure your data into logical sections</div>
            <div>A good example of a sub-table is an <strong>"Invoice"</strong> has many <strong>"Line Items"</strong>
            </div>
            <div>Once applied, you will be able to add as many fields as you like to the table, and as many rows as you
                like
            </div>
            <div>Give the table a good plural name below, and configure the button with a good non-plural name</div>
            <div>You will be able to change any of these later of course</div>
        </div>
        <div>
            <label class="label">The sub-table name as a plural should be:</label>
            <input type="text" class="input input-bordered w-full" bind:value={model.pluralName}/>
            <label class="label">The "Add" button text should read:</label>
            <div class="flex items-center">
                <button class="btn btn-primary btn-sm mr-2">Add</button>
                <input type="text" class="input input-bordered w-full" bind:value={model.name}/>
            </div>
        </div>
    </div>
</div>

<div class="mt-8">
    <button class="btn btn-secondary" on:click={apply}>Apply sub-item</button>
    <button class="btn" on:click={cancel}>Cancel</button>
</div>

<style>
    .disabled-content {
        pointer-events: none;
        opacity: 0.5;
        border-width: 4px;
    }
</style>