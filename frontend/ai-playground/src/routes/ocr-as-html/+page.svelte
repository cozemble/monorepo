<script lang="ts">
    import RenderOcrJson from "./RenderOcrJson.svelte";

    let pastedJson = '';
</script>
<div>
    <textarea class="input input-bordered" bind:value={pastedJson} rows="10" cols="80"></textarea>
</div>
{#if pastedJson.trim().length > 0}
    {@const pages = JSON.parse(pastedJson).pages}
    <RenderOcrJson {pages} />
{/if}