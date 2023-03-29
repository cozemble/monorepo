<script lang="ts">
    import type {RecordEditContext} from '../../lib'
    import RecordEditContextInspector from './RecordEditContextInspector.svelte'

    export let editContexts: RecordEditContext[]
</script>

<div class="inspector-container">
    <div class="events-container">
        {#each editContexts as editContext, index}
            <RecordEditContextInspector {editContext} {index}/>
        {/each}
    </div>
</div>

<style>
    .inspector-container {
        display: flex;
    }

</style>
