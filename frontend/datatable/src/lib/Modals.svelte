<script lang="ts">

    import {editModelModal} from "./modelUi";
    import EditModelModal from "./EditModelModal.svelte";
</script>

{#if $editModelModal}
    <EditModelModal />
{/if}
