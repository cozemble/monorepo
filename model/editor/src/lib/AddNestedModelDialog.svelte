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
<h5>{`Add nested model to ${parentModel.name.value}`}</h5>

<label for="cardinality">Cardinality</label><br/>
<select id="cardinality" bind:value={cardinality} class="cardinality">
    <option value="one">One</option>
    <option value="many">Many</option>
</select><br/>
<label for="modelName">Model name</label><br/>
<input type="text" id="modelName" bind:value={modelName} class="model-name"><br/>
{#if cardinality === "many"}
    <label for="modelNameAsPlural">Model name as plural</label><br/>
    <input type="text" id="modelNameAsPlural" bind:value={modelNameAsPlural} class="model-name-as-plural"><br/>
{/if}
{#if cardinality === "one"}
    <p>Every <strong>{parentModel.name.value}</strong> has one <em>{ifEmpty(modelName, '....')}</em></p>
{:else}
    <p>Every <strong>{parentModel.name.value}</strong> has zero, one or more
        <em>{ifEmpty(modelNameAsPlural, '....')}</em> of type <em>{ifEmpty(modelName, '....')}</em></p>
{/if}
<button type="submit" on:click|preventDefault={apply} class="save">Apply</button>
<button on:click={close} class="close">Close</button>
<div>

</div>


