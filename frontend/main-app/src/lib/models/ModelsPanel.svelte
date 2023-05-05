<script lang="ts">
    import {addNewModel, eventSourcedModels, modelBeingEdited} from "./modelsStore";
    import ModelList from "./ModelList.svelte";
    import EditModel from "./EditModel.svelte";

    export let tenantId: string

</script>

{#if $modelBeingEdited}
    <EditModel modelId={$modelBeingEdited.modelId} {tenantId} editImmediately={$modelBeingEdited.context === 'create'}
               on:finished={() => modelBeingEdited.set(null)}/>
{:else}
    {#if $eventSourcedModels.length === 0}
        <div class="alert alert-info shadow-lg">
            <div class="flex">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     class="stroke-current flex-shrink-0 w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div class="ml-2">
                    <p>Everything in cozemble is based on models. Models are the data "things" in your business, like
                        Customers, Orders, Invoices and Bookings.</p><br/>
                    <p>Click the button below to create your first one.</p>
                </div>
            </div>
        </div>
        <button class="btn btn-primary" type="button" on:click={addNewModel}>Add first model</button>
    {:else}
        <ModelList/>
        <button class="btn btn-primary" type="button" on:click={addNewModel}>Add another model</button>
    {/if}
{/if}

<style>
    button {
        margin-top: 0.5em;
    }

    .alert-info .flex {
        align-items: flex-start;
    }

</style>