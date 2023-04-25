<script lang="ts">
    import {dataRecordFns, modelFns} from "./types";
    import DataTable from "./DataTable.svelte";

    let model = modelFns.newInstance("Untitled sub-record", "Untitled sub-record")
    model = modelFns.addField(model, "Field 1")
    const records = [dataRecordFns.newInstance()]
</script>


<div class="card bg-base-200 shadow-xl pt-2">
    <div class="card-body">
        <div class="tooltip tooltip-open tooltip-accent" data-tip="Preview of your sub-record">
            <div class="disabled-content border border-info rounded p-2">
                <DataTable {model} {records} oneOnly={true} permitSubItemAddition={false}/>
            </div>
        </div>
        <div class="alert alert-info flex flex-col items-start">
            <div>This is a preview of how your sub-record will look</div>
            <div>Use sub-records to structure your data into logical sections</div>
            <div>A good example of a sub-record is a <strong>"Customer"</strong> has one <strong>"Home Address"</strong>
            </div>
            <div>Once applied, you will be able to add as many fields as you like to the sub-record</div>
            <div>Give the sub-record a good non-plural name. You will be able to change it later of course</div>
        </div>
        <div>
            <label class="label">Sub-record name:</label>
            <input type="text" class="input input-bordered w-full" bind:value={model.name}/>
        </div>

    </div>
</div>


<div class="mt-8">
    <button class="btn btn-secondary">Apply sub-item</button>
    <button class="btn">Cancel</button>
</div>

<style>
    .disabled-content {
        pointer-events: none;
        opacity: 0.5;
        border-width: 4px;
    }
</style>