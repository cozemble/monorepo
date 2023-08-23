<script lang="ts">
    import {labelTable} from "./types";
    import {writable} from "svelte/store";
    import ZodForm from "$lib/containers/ZodForm.svelte";

    const object = {}
    const schema = labelTable
    export let showErrors = writable(false)

</script>
<label class="label">Show errors</label>
<input type="checkbox" bind:checked={$showErrors}/>
<ZodForm {schema} {object} {showErrors}/>