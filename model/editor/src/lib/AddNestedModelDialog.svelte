<script lang="ts">
    import {createEventDispatcher} from 'svelte'
    import type {Model} from "@cozemble/model-core";

    export let parentModel: Model
    let cardinality = "one"
    let modelName = ""
    let modelNameAsPlural = ""

    function ifEmpty(str: string, ifEmpty: string): string {
        return str.trim().length > 0 ? str : ifEmpty
    }

    const dispatch = createEventDispatcher()

    function close() {
        dispatch('close')
    }

    function apply() {
        if (cardinality === "one") {
            dispatch("relationshipAdded", {cardinality, modelName, relationshipName: modelName})
        } else {
            dispatch("relationshipAdded", {cardinality, modelName, relationshipName: modelNameAsPlural})
        }
    }
</script>
<h5>{`Add nested model to ${parentModel.name}`}</h5>

<label for="cardinality">Cardinality</label><br/>
<select id="cardinality" bind:value={cardinality}>
    <option value="one">One</option>
    <option value="many">Many</option>
</select><br/>
<label for="modelName">Model name</label><br/>
<input type="text" id="modelName" bind:value={modelName}><br/>
{#if cardinality === "many"}
    <label for="modelNameAsPlural">Model name as plural</label><br/>
    <input type="text" id="modelNameAsPlural" bind:value={modelNameAsPlural}><br/>
{/if}
{#if cardinality === "one"}
    <p>Every <strong>{parentModel.name}</strong> has one <em>{ifEmpty(modelName, '....')}</em></p>
{:else}
    <p>Every <strong>{parentModel.name}</strong> has zero, one or more
        <em>{ifEmpty(modelNameAsPlural, '....')}</em> of type <em>{ifEmpty(modelName, '....')}</em></p>
{/if}
<button type="submit" on:click|preventDefault={apply}>Apply</button>
<button on:click={close}>Close</button>
<div>

</div>


