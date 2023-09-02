<script lang="ts">
    import { createEventDispatcher } from 'svelte'
    export let schemaStr: string

    const dispatch = createEventDispatcher()
    function save() {
        dispatch('edited',schemaStr)
    }
    function cancel() {
        dispatch('cancel')
    }
</script>
<div class="flex flex-col w-full items-center">
    <div >
        <button class="btn btn-primary" on:click={save}>Save</button>
        <button class="ml-4 btn btn-secondary" on:click={cancel}>Cancel</button>
    </div>
    <div class="mt-4 w-full">
        <textarea class="input input-bordered w-full h-screen p-8" bind:value={schemaStr}/>
    </div>
</div>