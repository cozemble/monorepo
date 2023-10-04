<script lang="ts">
    import type {Table} from "@cozemble/backend-aws-ocr-types";
    import StreamingJson from "./StreamingJson.svelte";
    import {limitRows} from "./TableAI";
    import {tableToCsv} from "../fromDocument/tableToCsv";

    export let tables:Table[]
    const tableOrTables = tables.length === 1 ? "table" : "tables"
    const tablesWithLimitedRows = tables.map(t => limitRows(3, t))
    const tablesAsCsv = tablesWithLimitedRows
        .map((t, index) => {
            const csv = tableToCsv(t)
            return `Table ${index + 1}\n${csv}\n`
        })
        .join('\n')
</script>

<h3 class="mx-auto">We found {tables.length} {tableOrTables}.....performing analysis</h3>

<StreamingJson api="/genai/tables/guessTableType" body={{tableCount:tables.length, tablesAsCsv}} on:completion/>
