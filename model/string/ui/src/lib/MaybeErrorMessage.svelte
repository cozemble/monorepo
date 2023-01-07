<script lang="ts">
export let showErrors: boolean
export let errors: Map<string, string>
export let key: string
</script>

{#if showErrors && errors.has(key)}
  <div class="error">
    {errors.get(key)}
  </div>
{/if}

<style>
.error {
  color: red;
}
</style>
