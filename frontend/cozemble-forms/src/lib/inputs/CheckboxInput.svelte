<script lang="ts">

    import InputLabel from "$lib/inputs/InputLabel.svelte";

    export let key: string
    export let value: boolean
</script>

<InputLabel {key}/>
<input type="checkbox" class="input input-bordered" bind:checked={value}/>
