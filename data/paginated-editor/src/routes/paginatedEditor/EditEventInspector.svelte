<script lang="ts">
    import type {RecordEditContext} from "$lib/RecordEditContext";
    import RecordEditContextInspector from './RecordEditContextInspector.svelte';

    export let editContexts: RecordEditContext[]
</script>

{#each editContexts as editContext, index}
    <RecordEditContextInspector {editContext} {index}/>
{/each}