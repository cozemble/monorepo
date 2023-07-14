<script lang="ts">
    import type {JsonSchemaProperty} from "@cozemble/model-core";
    import type {Writable} from "svelte/store";

    export let property: JsonSchemaProperty
    export let propertyKey: string
    export let value: Writable<any>

    $: enumValues = calcEnumValues(property)

    function selectionChanged(event: Event) {
        value.update(v => {
            const selected = (event.target as HTMLSelectElement).value
            if (selected === "cozemble.null") {
                delete v[propertyKey];
                return v;
            }
            v[propertyKey] = selected;
            return v;
        });
    }

    function calcEnumValues(property: JsonSchemaProperty): { id: string, value: string }[] {
        if (property.enum === undefined) {
            return [];
        }
        return property.enum.map((v: any) => {
            const id = v.id ?? v;
            const value = v.value ?? v.name ?? v.label ?? v;
            return {id, value};
        });
    }

</script>

<select class="form-select input input-bordered w-full {propertyKey}" value={$value[propertyKey]}
        on:change={selectionChanged}>
    <option value="cozemble.null" selected={$value[propertyKey] === undefined}>Select...</option>
    {#each enumValues as option}
        <option value={option.id} selected={$value[propertyKey] === option.id}>{option.value}</option>
    {/each}
</select>
