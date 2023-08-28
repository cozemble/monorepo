<script lang="ts">
    import {writable} from "svelte/store";
    import OcrJsonCorrection from "./OcrJsonCorrection.svelte";

    let pastedJson = '';
</script>
<div>
    <textarea class="input input-bordered" bind:value={pastedJson} rows="10" cols="80"></textarea>
</div>
{#if pastedJson.trim().length > 0}
    {@const parsedPages = JSON.parse(pastedJson).pages}
    <OcrJsonCorrection pages={writable(parsedPages)}/>
{/if}