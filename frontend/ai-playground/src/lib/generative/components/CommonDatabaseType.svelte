<script lang="ts">
    import {createEventDispatcher} from 'svelte'

    export let commonDatabaseType: string
    export let index: number

    const dispatch = createEventDispatcher()

    function useDatabaseType(event: Event) {
        event.preventDefault()
        event.stopPropagation()
        dispatch('choice', {commonDatabaseType})
    }

</script>

{#if index > 0}
    <a href="!#" class="link link-primary ml-16 mt-4" on:click={useDatabaseType}>{commonDatabaseType}</a>
{:else}
    <a href="!#" class="link link-primary mt-4" on:click={useDatabaseType}>{commonDatabaseType}</a>
{/if}
