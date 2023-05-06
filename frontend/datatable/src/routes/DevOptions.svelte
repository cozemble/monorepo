<script lang="ts">
    import type {Writable} from 'svelte/store';

    export let permitModelling: Writable<boolean>
    export let showDevConsole: Writable<boolean>
</script>

<div class="flex">
    <label class="label">Permit modelling</label>
    <input type="checkbox" bind:checked={$permitModelling}/>
    <label class="label ml-4">Show dev console</label>
    <input type="checkbox" bind:checked={$showDevConsole}/>
</div>
<div class="border border-base-300 mb-2">
</div>
