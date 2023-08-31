<script lang="ts">
    import type {FomArray, FomIssue} from "../Fom";
    import {type Readable, writable, type Writable} from "svelte/store";
    import {defaultComponentFinder, defaultErrorComponentFinder} from "./componentPolicy";
    import {getContext, setContext} from "svelte";
    import FomObject from "../components/FomObject.svelte";
    import FomDiscriminatedUnion from "../components/FomDiscriminatedUnion.svelte";

    export let schema: FomArray
    export let object: Writable<any[]>
    export let showErrors = writable(false)
    export let errors: Readable<FomIssue[]>
    export let rootItemName: string
    export let itemSummarizer: any
    let indexOfItemBeingEdited = null as number | null
    let editType: "edit" | "add" | null = null
    let cancelOperation: () => void = () => {
    }

    function ensureComponentFinder() {
        if (!getContext('component.finder')) {
            setContext('component.finder', defaultComponentFinder)
        }
        if (!getContext('error.component.finder')) {
            setContext('error.component.finder', defaultErrorComponentFinder)
        }
    }

    ensureComponentFinder()

    function addItem() {
        showErrors.set(false)
        const newItem = {}
        object.update(items => [...items, newItem])
        indexOfItemBeingEdited = $object.length - 1
        editType = "add"
        cancelOperation = () => {
            object.update(items => items.slice(0, items.length - 1))
        }
    }

    function cancel() {
        cancelOperation()
        cancelOperation = () => {
        }
        indexOfItemBeingEdited = null
    }

    function save() {
        if ($errors.length > 0) {
            showErrors.set(true)
        } else {
            cancelOperation = () => {
            }
            indexOfItemBeingEdited = null
        }
    }

    function deleteItem(index: number) {
        object.update(items => items.filter((_, i) => i !== index))
    }

    function editItem(index: number) {
        showErrors.set(false)
        indexOfItemBeingEdited = index
        editType = "edit"
        const copyBeforeEdit = JSON.parse(JSON.stringify($object[index]))
        cancelOperation = () => {
            object.update(items => {
                items[index] = copyBeforeEdit
                return items
            })
            indexOfItemBeingEdited = null
        }
    }
</script>

{#if indexOfItemBeingEdited !== null}
    {#if editType === "add"}
        <h5>Add a new {rootItemName}</h5>
    {:else}
        <h5>Edit {rootItemName} #{indexOfItemBeingEdited + 1}</h5>
    {/if}
    {#if schema.element.type === "object"}
        <FomObject schema={schema.element} bind:value={$object[indexOfItemBeingEdited]} errors={$errors}
                   showErrors={$showErrors}
                   path={[indexOfItemBeingEdited]}/>
    {:else if schema.element.type === "discriminatedUnion"}
        {#if editType === 'add'}
            <h6 class="mb-2 mt-2">Select {rootItemName} type</h6>
        {:else}
            <h6 class="mb-2 mt-2">{rootItemName} type</h6>
        {/if}
        <FomDiscriminatedUnion field={schema.element} bind:value={$object[indexOfItemBeingEdited]}
                               path={[indexOfItemBeingEdited]}
                               errors={$errors} showErrors={$showErrors}/>
    {:else}
        <p class="text-danger">FomArray can only edit objects or discriminated unions</p>
    {/if}
    <div class="mt-2">
        <button class="btn btn-primary" on:click={save}>Save</button>
        <button class="btn btn-secondary" on:click={cancel}>Cancel</button>
    </div>
{:else}
    <table>
        {#each $object as item, index}
            <tr>
                <td>
                    <div class="mr-4">{index + 1}</div>
                </td>
                <td>
                    <svelte:component this={itemSummarizer} {item} {index}/>
                </td>
                <td>
                    <div class="ml-4">
                        <button class="btn btn-xs" on:click={() => editItem(index)}>Edit</button>
                        <button class="btn btn-xs" on:click={() => deleteItem(index)}>Delete</button>
                    </div>
                </td>
            </tr>
        {/each}
    </table>
    <button class="btn btn-primary mt-2" on:click={addItem}>Add {rootItemName}</button>
{/if}
