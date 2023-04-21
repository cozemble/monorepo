<script lang="ts">
    import {type DataRecord, dataRecordFns, modelFns} from "./types";
    import DataTable from "./DataTable.svelte";

    let model = modelFns.newInstance("Invoice")
    let expandedRecordId: string | null = null
    model = modelFns.addField(model, "Invoice ID")
    model = modelFns.addField(model, "Invoice Date")
    model = modelFns.addField(model, "Order Number")

    let records: DataRecord[] = []

    function addRecord() {
        records = [...records, dataRecordFns.newInstance()]
    }

    addRecord()
    addRecord()

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
</script>

<DataTable bind:model bind:records/>