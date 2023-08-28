<script lang="ts">
    import InputLabel from "$lib/inputs/InputLabel.svelte";

    export let key: string
    export let value: string
</script>

<InputLabel {key}/>
<input type="text" class="input input-bordered" bind:value={value}/>
