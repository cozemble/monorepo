<script lang="ts">
    import SimpleCustomerTable from "../../../lib/explainer/SimpleCustomerTable.svelte";
    import {onMount} from "svelte";
    import {registerEverything} from "@cozemble/model-assembled";
    import ExplainerButtons from "../../../lib/explainer/ExplainerButtons.svelte";
    import SimpleInvoiceTable from "../../../lib/explainer/SimpleInvoiceTable.svelte";

    let step = 1
    const lastStep = 3

    function next() {
        step += 1
    }

    function previous() {
        step -= 1
    }

    function finish() {
        console.log("finish")
    }

    let mounted = false
    onMount(() => {
        registerEverything();
        mounted = true
    })
</script>

{#if mounted}
    {#if step === 1}
        <div>This is where you create tables to store your data. There is an example below - a table of Customer records</div>
        <div class="mt-4">
            <ExplainerButtons {next} {previous} {finish} {step} {lastStep}/>
        </div>
        <div class="mt-8 disabled">
            <SimpleCustomerTable/>
        </div>
    {/if}
    {#if step === 2}
        <div>Data can be structured by adding <strong><em>Inner Tables</em></strong>. For example, here is an Invoice
            table, with the first record expanded to show
            an inner table of Line Items
        </div>
        <div class="mt-4">
            <ExplainerButtons {next} {previous} {finish} {step} {lastStep}/>
        </div>
        <div class="mt-8 disabled">
            <SimpleInvoiceTable/>
        </div>
    {/if}
    {#if step === 3}
        <div>And here is an example of a Customer with an <strong><em>Inner Record</em></strong> to keep the address
            data
            neatly tucked away
        </div>
        <div class="mt-4">
            <ExplainerButtons {next} {previous} {finish} {step} {lastStep}/>
        </div>
    {/if}
{/if}

<style>
    .disabled {
        pointer-events: none;
    }
</style>