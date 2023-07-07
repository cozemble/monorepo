<script lang="ts">
    import type {JsonSchema} from "@cozemble/model-core";
    import type {Writable} from "svelte/store";
    import Label from "$lib/components/Label.svelte";
    import MaybeErrorMessage from "$lib/components/MaybeErrorMessage.svelte";

    export let schema: JsonSchema
    export let value: Writable<any>
    export let showErrors = false
    export let errors: Map<string, string> = new Map<string, string>()

    function checkboxChanged(event: Event, propertyKey: string) {
        $value[propertyKey] = (event.target as HTMLInputElement).checked;
    }

    function handleCheckboxChange(propertyKey: string) {
        return (event: Event) => checkboxChanged(event, propertyKey);
    }

</script>

{#each Object.keys(schema.properties) as propertyKey}
    {@const property = schema.properties[propertyKey]}
    <div class="form-group mb-3">
        {#if property.type === "string"}
            <Label {property} {propertyKey}/>
            <input type="text" class="form-control input input-bordered w-full {propertyKey}" bind:value={$value[propertyKey]}/>
            <MaybeErrorMessage key={propertyKey} {errors} {showErrors}/>
        {:else if property.type === "number"}
            <Label {property} {propertyKey}/>
            <input type="number" class="form-control input input-bordered w-full {propertyKey}" bind:value={$value[propertyKey]}/>
            <MaybeErrorMessage key={propertyKey} {errors} {showErrors}/>
        {:else if property.type === "boolean"}
            <div class="flex">
                <input type="checkbox" class="checkbox {propertyKey}" checked={$value[propertyKey] === true}
                       on:change={handleCheckboxChange(propertyKey)}/>
                <Label {property} {propertyKey} clazz="ml-3"/>
                <MaybeErrorMessage key={propertyKey} {errors} {showErrors}/>
            </div>
        {:else}
            to do: {property.type}
        {/if}
    </div>
{/each}
