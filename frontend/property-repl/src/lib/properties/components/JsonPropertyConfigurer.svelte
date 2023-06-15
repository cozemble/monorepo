<script lang="ts">
    import type {JsonProperty, JsonPropertyDescriptor, Model} from "@cozemble/model-core";
    import {propertyDescriptors} from "@cozemble/model-core";
    import JsonPropertyConfigurerInner from "$lib/properties/components/JsonPropertyConfigurerInner.svelte";

    export let model: Model
    export let property: JsonProperty
    $: propertyDescriptor = propertyDescriptors.get(property.propertyType) as JsonPropertyDescriptor<JsonProperty, any>
    $: configSchema = propertyDescriptor?.configurationSchema

</script>

{#if configSchema}
    {#key property.propertyType.value}
        <JsonPropertyConfigurerInner {property} {configSchema}/>
    {/key}
{/if}