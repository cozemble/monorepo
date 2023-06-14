<script lang="ts">
    import JsonStringEditor from "$lib/properties/JsonStringEditor.svelte";
    import type {JsonProperty} from "@cozemble/model-core";

    export let property: JsonProperty
    export let value: any | null
    export let changeHandler: (value: any | null, submitEvent: KeyboardEvent | null) => void
    export let closeHandler: () => void

    $: displayable = value ?? ''
</script>
{#if property.jsonType.value === 'string'}
    <JsonStringEditor {property} {value} {changeHandler} {closeHandler}/>
{:else}
    <p>Unhandled json type: {property.jsonType}</p>
{/if}
