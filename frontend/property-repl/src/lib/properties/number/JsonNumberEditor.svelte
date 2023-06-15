<script lang="ts">
    import type {JsonProperty} from "@cozemble/model-core";
    import {GenericDecimalEditor} from "@cozemble/model-decimal-ui";
    import JsonIntegerEditor from "$lib/properties/number/JsonIntegerEditor.svelte";

    export let property: JsonProperty
    export let value: number | null
    export let changeHandler: (value: number | null, submitEvent: KeyboardEvent | null) => void

    $: decimalPlaces = property.configuration?.decimalPlaces ?? 0
</script>

{#if decimalPlaces === 0}
    <JsonIntegerEditor {value} {changeHandler}/>
{:else}
    <GenericDecimalEditor {value} numberOfDecimalPlaces={property.configuration.decimalPlaces} {changeHandler}/>
{/if}
