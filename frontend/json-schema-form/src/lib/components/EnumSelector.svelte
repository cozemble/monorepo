<script lang="ts">
    import type {JsonSchemaProperty} from "@cozemble/model-core";
    import type {Writable} from "svelte/store";

    export let property: JsonSchemaProperty
    export let propertyKey: string
    export let value: Writable<any>

    $: enumValues = property.enum as any[]

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

</script>

<select class="form-select input input-bordered w-full {propertyKey}" value={$value[propertyKey]}
        on:change={selectionChanged}>
    <option value="cozemble.null" selected={$value[propertyKey] === undefined}>Select...</option>
    {#each enumValues as enumValue}
        <option value={enumValue} selected={$value[propertyKey] === enumValue}>{enumValue}</option>
    {/each}
</select>
