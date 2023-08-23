<script lang="ts">

    import InputLabel from "$lib/inputs/InputLabel.svelte";
    import {z, type ZodIssue} from "zod";
    import ZodObject from "$lib/containers/ZodObject.svelte";

    export let key: string
    export let value: any[]
    export let path: string[]
    export let field: z.ZodArray<any>
    export let errors: ZodIssue[] = []
    export let showErrors: boolean


    function addItem() {
        value = [...value, {}]
    }

    function deleteItem(index: number) {
        value = value.filter((_, i) => i !== index)
    }

</script>

<InputLabel {key}/>
{#if value}
    {#each value as item, index}
        {@const extendedPath = [...path, index]}
        <div id={extendedPath.join('.')} class="ml-4 p-4 mb-2 flex">
            <div class="mr-4"><h4>{index + 1}</h4></div>
            <div class="border p-4 flex">
                <div>
                    {#if field.element instanceof z.ZodObject}
                        <ZodObject bind:value={item} schema={field.element} {errors} {showErrors}
                                   path={extendedPath}/>
                    {:else}
                        to do {field.element.constructor.name}
                    {/if}
                </div>
                <div class="delete-icon" on:click={() => deleteItem(index)} title="Delete this item">X</div>
            </div>
        </div>
    {/each}
    <button class="btn btn-primary" on:click={addItem}>Add {key}</button>
{/if}

<style>
    .delete-icon {
        cursor: pointer;
        font-weight: bold;
        font-size: 1.5rem;
        margin-left: auto;
    }
</style>