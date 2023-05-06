<script lang="ts">
    import type {Writable} from 'svelte/store'

    export let id: string
    export let label: string
    export let tab: Writable<string>
</script>

<a class="tab tab-lifted" class:tab-active={$tab === id} on:click={() => $tab = id}>{label}</a>
