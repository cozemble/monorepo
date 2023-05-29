<script lang="ts">
    import {createEventDispatcher, onMount} from "svelte";
    import {registerEverything} from "@cozemble/model-assembled";
    import ExplainerButtons from "./ExplainerButtons.svelte";
    import SimpleCustomerTable from "./SimpleCustomerTable.svelte";
    import SimpleInvoiceTable from "./SimpleInvoiceTable.svelte";
    import SimpleCustomerWithAddressTable from "./SimpleCustomerWithAddressTable.svelte";
    import {allEventSourcedModels} from "../stores/allModels";

    let step = 1
    const lastStep = 4
    const dispatch = createEventDispatcher()

    function next() {
        step += 1
    }

    function previous() {
        step -= 1
    }

    function finish() {
        console.log("Finishing")
        dispatch('finish')
    }

    let mounted = false
    onMount(() => {
        if ($allEventSourcedModels.models.length > 0) {
            console.error("Calling explainer with models in store")
            finish()
        } else {
            registerEverything()
            mounted = true
        }
    })
</script>

{#if mounted}
    <div>
        {#if step === 1}
            <div class="flex items-center flex-col">
                <div>Welcome to Cozemble. Let's take a quick tour</div>
                <div class="mt-4">
                    <ExplainerButtons {next} {previous} {finish} {step} {lastStep}/>
                </div>
            </div>
        {/if}
        {#if step === 2}
            <div class="flex items-center flex-col">
                <div>Use tables to store your data</div>
                <div class="mt-2">Here's a table of Customers</div>
                <div class="mt-4">
                    <ExplainerButtons {next} {previous} {finish} {step} {lastStep}/>
                </div>
                <div class="mt-8 disabled">
                    <SimpleCustomerTable/>
                </div>
            </div>
        {/if}
        {#if step === 3}
            <div class="flex items-center flex-col">
                <div>Data can be structured using <strong><em>Inner Records</em></strong></div>
                <div class="mt-2">Here's a Customer with an inner Address record</div>
                <div class="mt-4">
                    <ExplainerButtons {next} {previous} {finish} {step} {lastStep}/>
                </div>
                <div class="mt-8 disabled">
                    <SimpleCustomerWithAddressTable/>
                </div>
            </div>
        {/if}
        {#if step === 4}
            <div class="flex items-center flex-col">
                <div>Use an <strong><em>Inner Table</em></strong> to store multiple inner records</div>
                <div class="mt-2">Here's an Invoice with an inner table of line items</div>
                <div class="mt-4">
                    <ExplainerButtons {next} {previous} {finish} {step} {lastStep}/>
                </div>
                <div class="mt-8 disabled">
                    <SimpleInvoiceTable/>
                </div>
            </div>
        {/if}
    </div>
{/if}

<style>
    .disabled {
        pointer-events: none;
    }
</style>