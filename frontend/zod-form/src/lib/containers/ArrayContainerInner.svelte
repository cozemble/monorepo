<script lang="ts">

    import {z, type ZodIssue} from "zod";
    import ZodObject from "$lib/containers/ZodObject.svelte";
    import ZodDiscriminatedUnion from "$lib/containers/ZodDiscriminatedUnion.svelte";
    import {errorsAtPath} from "$lib/containers/helper";

    export let value: any[]
    export let path: string[]
    export let field: z.ZodArray<any>
    export let errors: ZodIssue[] = []
    export let showErrors: boolean
    export let itemName: string


    function addItem() {
        value = [...value, {}]
    }

    function deleteItem(index: number) {
        value = value.filter((_, i) => i !== index)
    }

</script>
{#each value as item, index}
    {@const extendedPath = [...path, index]}
    {@const extendedErrors = errorsAtPath(extendedPath, errors)}

    <div id={extendedPath.join('.')} class="ml-4 p-4 mb-2 flex">
        <div class="mr-4"><h4>{index + 1}</h4></div>
        <div class="border p-4 flex">
            <div>
                {#if field.element instanceof z.ZodObject}
                    <ZodObject bind:value={item} schema={field.element} errors={extendedErrors} {showErrors}
                               path={extendedPath}/>
                {:else if field.element instanceof z.ZodDiscriminatedUnion}
                    <ZodDiscriminatedUnion field={field.element} bind:value={item} path={extendedPath} errors={extendedErrors} {showErrors}/>
                {:else}
                    ArrayContainerInner: to do {field.element.constructor.name}
                {/if}
            </div>
            <div class="delete-icon" on:click={() => deleteItem(index)} title="Delete this item">X</div>
        </div>
    </div>
{/each}
<button class="btn btn-primary" on:click={addItem}>Add {itemName}</button>

<style>
    .delete-icon {
        cursor: pointer;
        font-weight: bold;
        font-size: 1.5rem;
        margin-left: auto;
    }
</style>