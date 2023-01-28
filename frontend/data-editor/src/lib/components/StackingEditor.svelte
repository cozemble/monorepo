<script lang="ts">
export let properties: Record<string, any> | undefined
</script>

{#if properties}
  {#each Object.keys(properties) as key}
    <div
      class="rounded-lg bg-base-300 flex flex-col p-4 g-4 border-solid border-l-2 border-secondary"
    >
      <h3 class="text-500 text-lg text-red-800 capitalize">{key}</h3>
      <!---->

      {#if properties[key].type === 'object'}
        <svelte:self properties={properties[key].properties} />
      {:else if properties[key].type === 'array'}
        <svelte:self properties={properties[key].items.properties} />
      {:else}
        <div class="flex flex-row">
          <div class="flex flex-col">
            <label for={key} class="label capitalize">{key}</label>
            <input type="text" name={key} class="input input-bordered" />
          </div>
        </div>
      {/if}
    </div>
  {/each}
{/if}
