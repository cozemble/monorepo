<script lang="ts">
    import {actions, labelTable} from "./types";
    import {writable} from "svelte/store";
    import ZodForm from "$lib/containers/ZodForm.svelte";

    let object = []
    const schema = actions
    export let showErrors = writable(false)

</script>
<label class="label">Show errors</label>
<input type="checkbox" bind:checked={$showErrors}/>
<ZodForm {schema} bind:object  {showErrors} rootItemName="Action"/>

<div>
    <pre>{JSON.stringify(object, null, 2)}</pre>
</div>