<script lang="ts">
    import {modelStore} from "$lib/generative/stores";
    import {navbarState} from "$lib/generative/stores.js";

    $: currentModel = $modelStore.models.find(m => m.model.id.value === $navbarState)

    let prompt = ""
</script>
{#if currentModel}
    <div class="flex flex-col">
        <h4 class="text-center mb-2">What changes would you like to make to your {currentModel.model.pluralName.value}
            table?</h4>
        <div class="mx-auto ">
            <input type="text text-center" class="input-bordered input" placeholder="Prompt to change {currentModel.model.pluralName.value} table" bind:value={prompt}/>
        </div>
        <div class="mx-auto mt-2">
            <button class="btn btn-primary">Apply change</button>
            <button class="btn btn-secondary">Add another table</button>
        </div>
    </div>
{/if}

<style>
    .input {
        width: calc(1ch * 50); /* adjust 10 to the number of characters you want */
    }
</style>