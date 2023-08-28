<script lang="ts">

    import type {FomArray, FomIssue} from "../Fom";
    import {errorsAtPath} from "./errorsAtPath";
    import FomDiscriminatedUnion from "./FomDiscriminatedUnion.svelte";
    import FomObject from "./FomObject.svelte";

    export let value: any[]
    export let path: string[]
    export let field: FomArray
    export let errors: FomIssue[]
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
                {#if field.element.type === 'object'}
                    <FomObject bind:value={item} schema={field.element} errors={extendedErrors} {showErrors}
                               path={extendedPath}/>
                {:else if field.element.type === "discriminatedUnion"}
                    <FomDiscriminatedUnion field={field.element} bind:value={item} path={extendedPath} errors={extendedErrors} {showErrors}/>
                {:else}
                    FomArrayContainerInner: to do {field.element.type}
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