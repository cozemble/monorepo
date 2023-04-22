<script lang="ts">
    import {type DataRecord, dataRecordFns, modelFns} from "./types";
    import DataTable from "./DataTable.svelte";

    let model = modelFns.newInstance("Invoice")
    model = modelFns.addField(model, "Invoice ID")
    model = modelFns.addField(model, "Invoice Date")
    model = modelFns.addField(model, "Order Number")

    let records: DataRecord[] = []

    function addRecord() {
        records = [...records, dataRecordFns.newInstance()]
    }

    addRecord()
    addRecord()

</script>

<DataTable bind:model bind:records/>