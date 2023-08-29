<script lang="ts">
    import InputLabel from "../inputs/InputLabel.svelte";
    import type {FomNumber} from "../fom/Fom.ts";

    export let key: string
    export let value: number
    export let field: FomNumber

</script>

<InputLabel {key}/>
<input type="number" class="input input-bordered" bind:value={value} min={field.min} max={field.max}/>
