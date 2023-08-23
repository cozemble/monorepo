<script lang="ts">
    import InputLabel from "$lib/inputs/InputLabel.svelte";
    import type {ZodIssue} from "zod";

    export let key: string
    export let value: string
    export let showErrors: boolean
    export let errors: ZodIssue[]
</script>

<InputLabel {key}/>
<input type="text" class="input input-bordered" bind:value={value}/>
