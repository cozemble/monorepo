<script lang="ts">
    import AddTableModal from "./AddTableModal.svelte";
    import {allModels} from "./stores/allModels";

    let rootDiv: HTMLDivElement;
    let addingTable = false

    async function addTable() {
        addingTable = true
    }
</script>


<div bind:this={rootDiv}>
    {#if $allModels.length === 0}
        <a class="tab tab-lg"
           on:click={addTable}>+ Add your first table</a>
    {:else}
        <a class="tab tab-lg"
           on:click={addTable}>+ Add table</a>
    {/if}
</div>

{#if addingTable}
    <AddTableModal anchorElement={rootDiv} on:finished={() => addingTable = false}/>
{/if}
