<script lang="ts">
    import AddTableModal from "./AddTableModal.svelte";
    import {allEventSourcedModels} from "./stores/allModels";
    import {createEventDispatcher} from "svelte";

    let rootDiv: HTMLDivElement;
    let addingTable = false
    const dispatch = createEventDispatcher()

    async function addTable() {
        console.log("adding table")
        addingTable = true
    }

    function cancel() {
        addingTable = false
    }
    function added(event:CustomEvent) {
        dispatch('added', event.detail)
        cancel()
    }
</script>


<div bind:this={rootDiv}>
    {#if $allEventSourcedModels.models.length === 0}
        <a class="tab tab-lg add-table-link"
           on:click={addTable}>+ Add your first table</a>
    {:else}
        <a class="tab tab-lg add-table-link"
           on:click={addTable}>+ Add table</a>
    {/if}
</div>

{#if addingTable}
    <AddTableModal anchorElement={rootDiv} on:cancel={cancel} on:added={added}/>
{/if}
