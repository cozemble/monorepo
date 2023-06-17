<script lang="ts">
    import type {JsonSchema} from "@cozemble/model-core";
    import {strings} from "@cozemble/lang-util";

    export let schema: JsonSchema
    export let value: any

    function checkboxChanged(event: Event, propertyKey: string) {
        value[propertyKey] = (event.target as HTMLInputElement).checked;
    }

    function handleCheckboxChange(propertyKey: string) {
        return (event: Event) => checkboxChanged(event, propertyKey);
    }
</script>

{#each Object.keys(schema.properties) as propertyKey}
    {@const property = schema.properties[propertyKey]}
    <div class="form-group mb-3">
        {#if property.type === "string"}
            <label>{property.title ?? strings.camelcaseToSentenceCase(propertyKey)}</label>
            <input type="text" class="form-control input input-bordered" bind:value={value[propertyKey]}/>
        {:else if property.type === "number"}
            <label>{property.title ?? strings.camelcaseToSentenceCase(propertyKey)}</label>
            <input type="number" class="form-control input input-bordered" bind:value={value[propertyKey]}/>
        {:else if property.type === "boolean"}
            <div class="flex">
                <input type="checkbox" class="checkbox" checked={value[propertyKey] === true}
                       on:change={handleCheckboxChange(propertyKey)}/>
                <label class="ml-3">{property.title ?? strings.camelcaseToSentenceCase(propertyKey)}</label>
            </div>
        {:else}
            to do: {property.type}
        {/if}
    </div>
{/each}
