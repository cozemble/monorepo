<script lang="ts">
    import JsonStringEditor from "$lib/properties/string/JsonStringEditor.svelte";
    import type {JsonProperty} from "@cozemble/model-core";
    import JsonNumberEditor from "$lib/properties/number/JsonNumberEditor.svelte";

    export let property: JsonProperty
    export let value: any | null
    export let changeHandler: (value: any | null, submitEvent: KeyboardEvent | null) => void
    export let closeHandler: () => void

    $: displayable = value ?? ''
</script>
{#if property.jsonType.value === 'string'}
    <JsonStringEditor {property} {value} {changeHandler} {closeHandler}/>
{:else if property.jsonType.value === 'number'}
    <JsonNumberEditor {property} {value} {changeHandler}/>
{:else}
    <p>Unhandled json type: {property.jsonType}</p>
{/if}
