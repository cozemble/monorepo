<script lang="ts">
    import DictationModal from "$lib/dictate/DictationModal.svelte";

    let showDictationModal = false

    function showDictation() {
        showDictationModal = true
    }

</script>

<button class="btn btn-ghost btn-active btn-sm  mr-2" on:click={showDictation}>
    Dictate
</button>

{#if showDictationModal}
    <DictationModal on:close={() => showDictationModal = false}/>
{/if}