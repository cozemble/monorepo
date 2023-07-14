<script lang="ts">
    import JsonStringEditor from "$lib/properties/string/JsonStringEditor.svelte";
    import type {JsonProperty} from "@cozemble/model-core";
    import JsonNumberEditor from "$lib/properties/number/JsonNumberEditor.svelte";
    import {afterUpdate} from "svelte";
    import type {ChangeHandler} from "$lib";

    export let property: JsonProperty
    export let value: any | null
    export let changeHandler: ChangeHandler<any>
    export let closeHandler: () => void
    console.log({property, value})
    afterUpdate(() => console.log({property, value}))
</script>

{#if property.jsonType.value === 'string'}
    <JsonStringEditor configuration={property.configuration} {value} {changeHandler} {closeHandler}/>
{:else if property.jsonType.value === 'number'}
    <JsonNumberEditor configuration={property.configuration} {value} {changeHandler}/>
{:else}
    <p>Unhandled json type: {property.jsonType.value}</p>
{/if}
