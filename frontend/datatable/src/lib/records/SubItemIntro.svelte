<script lang="ts">
    import ExplainSubRecords from "./ExplainSubRecords.svelte";
    import ExplainSubTables from "./ExplainSubTables.svelte";

    let step: "explain-sub-records" | "explain-sub-tables" = "explain-sub-records"

    function next() {
        if (step === "explain-sub-records") {
            step = "explain-sub-tables"
        } else {
            throw new Error("Unknown step")
        }
    }
</script>
{#if step === "explain-sub-records"}
    <ExplainSubRecords/>
{:else if step === "explain-sub-tables"}
    <ExplainSubTables/>
{:else}
    <p>Unknown step</p>
{/if}

<button class="btn btn-success mt-2 px-8" on:click={next}>Next</button>

