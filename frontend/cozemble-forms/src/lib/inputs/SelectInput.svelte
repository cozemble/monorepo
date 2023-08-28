<script lang="ts">
    import InputLabel from "../inputs/InputLabel.svelte";
    import {strings} from "@cozemble/lang-util";

    export let key: string
    export let value: string
    export let values: string[]
</script>

<InputLabel {key}/>
<select class="input input-bordered" bind:value={value}>
    {#each values as v}
        <option value={v} selected={v === value}>{strings.camelcaseToSentenceCase(v)}</option>
    {/each}
</select>
