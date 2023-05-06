<script lang="ts">
    import {createNewRecordStore} from "./recordCreatorStore";
    import CreateNewRecord from "./CreateNewRecord.svelte";
</script>
{#if $createNewRecordStore}
    <CreateNewRecord params={$createNewRecordStore}/>
{/if}
<div class:invisible={$createNewRecordStore !== null}>
    <slot></slot>
</div>
