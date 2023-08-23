<script lang="ts">
    import {labelTable} from "./types";
    import ZodForm from "./ZodForm.svelte";
    import {writable} from "svelte/store";

    const object = {}
    const schema = labelTable
    export let showErrors = writable(false)

</script>
<label class="label">Show errors</label>
<input type="checkbox" bind:checked={$showErrors}/>
<ZodForm {schema} {object} {showErrors}/>