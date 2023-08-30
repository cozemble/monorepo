<script lang="ts">
    export let text:string

    $: lines = text.split('\n')
</script>
{#each lines as line}
    <p>{line}</p>
{/each}