<script lang="ts">
    import type {EventSourcedModelStore} from "./types";
    import AddTableModal from "./AddTableModal.svelte";

    export let tables: EventSourcedModelStore

    let rootDiv: HTMLDivElement;
    let addingTable = false

    async function addTable() {
        addingTable = true
    }
</script>


<div bind:this={rootDiv}>
    {#if $tables.length === 0}
        <a class="tab tab-lg"
           on:click={addTable}>+ Add your first table</a>
    {:else}
        <a class="tab tab-lg"
           on:click={addTable}>+ Add table</a>
    {/if}
</div>

{#if addingTable}
    <AddTableModal anchorElement={rootDiv} {tables} on:finished={() => addingTable = false}/>
{/if}
