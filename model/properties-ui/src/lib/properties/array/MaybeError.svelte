<script lang="ts">
    export let errors: string[]
</script>

{#if errors.length > 0}
    <div class="text-error">{errors[0]}</div>
{/if}