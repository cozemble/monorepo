<script lang="ts">

    import {strings} from "@cozemble/lang-util";

    export let key: string
    export let value: boolean
</script>


<div class="flex">
    <input type="checkbox" class="input input-bordered" bind:checked={value}/>
    <label class="label">{strings.camelcaseToSentenceCase(key)}</label>
</div>

