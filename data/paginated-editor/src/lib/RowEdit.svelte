<script lang="ts">
    import type {DataRecord, Model} from "@cozemble/model-core";
    import type {CellFocus} from "$lib/CellFocus";
    import type {Writable} from "svelte/store";
    import RowEditInner from "$lib/RowEditInner.svelte";

    export let model: Model
    export let focus: Writable<CellFocus | null>
    export let rowIndex: number
    export let record: DataRecord

    const clonedRecord = {...record}

</script>

<RowEditInner {model} {focus} {rowIndex} record={clonedRecord} on:cancel/>
