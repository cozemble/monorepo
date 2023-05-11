<script lang="ts">
    export let step: number
    export let lastStep: number
    export let next: () => void
    export let previous: () => void
    export let finish: () => void
</script>

{#if step === 1}
    <button class="btn btn-primary" on:click={next}>Next</button>
{:else if step === lastStep}
    <button class="btn btn-primary" on:click={finish}>Finish</button>
{:else}
    <button class="btn btn-primary" on:click={next}>Next</button>
    <button class="btn btn-secondary" on:click={previous}>Previous</button>
{/if}
