<script lang="ts">
    import type {Table} from "@cozemble/backend-aws-ocr-types";
    import Paragraphs from "./Paragraphs.svelte";

    export let table:Table
</script>

<table class="table border mt-4">
    {#each table.rows as row}
        <tr class="border">
            {#each row.cells as cell}
                <td class="border">
                    <Paragraphs text={cell} />
                </td>
            {/each}
        </tr>
    {/each}
</table>