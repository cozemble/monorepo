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
<a href="!#" class="link link-primary mt-4 whitespace-nowrap" on:click={useDatabaseType}>{commonDatabaseType}</a>
