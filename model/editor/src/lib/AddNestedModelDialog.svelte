<script lang="ts">
    import {createEventDispatcher} from 'svelte'
    import type {Model} from '@cozemble/model-core'

    export let parentModel: Model
    let cardinality = 'one'
    let modelName = ''
    let modelNameAsPlural = ''
    let error: string | null = null

    function ifEmpty(str: string, ifEmpty: string): string {
        return str.trim().length > 0 ? str : ifEmpty
    }

    const dispatch = createEventDispatcher()

    function close() {
        error = null
        dispatch('cancel')
    }

    function apply() {
        error = null
        if (cardinality === 'one') {
            if (modelName.trim().length === 0) {
                error = 'Model name is required'
                return
            }
            dispatch('relationshipAdded', {
                cardinality,
                modelName,
                relationshipName: modelName,
            })
        } else {
            if (modelName.trim().length === 0) {
                error = 'Model name is required'
                return
            }
            if (modelNameAsPlural.trim().length === 0) {
                error = 'Model name as plural is required'
                return
            }
            dispatch('relationshipAdded', {
                cardinality,
                modelName,
                relationshipName: modelNameAsPlural,
            })
        }
    }

    function keydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            close()
        }
        error = null
    }
</script>

<h5>{`Add nested model to ${parentModel.name.value}`}</h5>

<svelte:window on:keydown={keydown}/>

<label for="cardinality">Every {parentModel.name.value} has:</label><br/>
<select id="cardinality" bind:value={cardinality} class="cardinality input input-bordered">
    <option value="one">One</option>
    <option value="many">Many</option>
</select><br/>
<label for="modelName">Model name</label><br/>
<input type="text" id="modelName" bind:value={modelName} class="model-name input input-bordered"/><br/>
{#if cardinality === 'many'}
    <label for="modelNameAsPlural">Model name as plural</label><br/>
    <input type="text" id="modelNameAsPlural" bind:value={modelNameAsPlural}
           class="model-name-as-plural input input-bordered"/><br/>
{/if}
{#if cardinality === 'one'}
    <p>
        Every <strong>{parentModel.name.value}</strong> has one
        <em>{ifEmpty(modelName, '....')}</em>
    </p>
{:else}
    <p>
        Every <strong>{parentModel.name.value}</strong> has zero, one or more
        <em>{ifEmpty(modelNameAsPlural, '....')}</em> of type
        <em>{ifEmpty(modelName, '....')}</em>
    </p>
{/if}
{#if error}
    <div class="alert alert-error shadow-lg my-2">
        <div>
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none"
                 viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{error}</span>
        </div>
    </div>
{/if}
<button type="submit" on:click|preventDefault={apply} class="save btn btn-primary">Apply</button>
<button on:click={close} class="close btn btn-secondary">Cancel</button>
