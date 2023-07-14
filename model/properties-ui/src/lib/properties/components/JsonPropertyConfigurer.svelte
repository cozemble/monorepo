<script lang="ts">
    import type {JsonProperty, JsonPropertyDescriptor} from "@cozemble/model-core";
    import { jsonSchemaFns, propertyDescriptors } from "@cozemble/model-core";
    import JsonPropertyConfigurerInner from "$lib/properties/components/JsonPropertyConfigurerInner.svelte";
    import {DownCaret} from "@cozemble/ui-atoms";

    export let property: JsonProperty
    export let showErrors = false
    $: propertyDescriptor = propertyDescriptors.get(property.propertyType) as JsonPropertyDescriptor<JsonProperty, any>
    $: configSchema = propertyDescriptor?.configurationSchema
    $: mandatorySchema = configSchema ? propertyDescriptor.augmentConfigurationSchema(jsonSchemaFns.requiredPropertiesOnly(configSchema)) : null
    $: optionalSchema = configSchema ? propertyDescriptor.augmentConfigurationSchema(jsonSchemaFns.optionalPropertiesOnly(configSchema)) : null
    $: errors = propertyDescriptor.validateProperty(property)

</script>

{#if configSchema}
    {#key property.propertyType.value}
        {#if mandatorySchema}
            <div class="mt-2">
                <JsonPropertyConfigurerInner {property} configSchema={mandatorySchema} {showErrors} {errors}/>
            </div>
        {/if}
        {#if optionalSchema}
            <div class="mt-2">
                <div class="collapse">
                    <input type="checkbox" class="more-options"/>
                    <div class="collapse-title flex px-0">
                        <strong>More Options</strong>
                        <div class="mt-1 ml-1">
                            <DownCaret/>
                        </div>
                    </div>
                    <div class="collapse-content">
                        <JsonPropertyConfigurerInner {property} configSchema={optionalSchema} {showErrors} {errors}/>
                    </div>
                </div>
            </div>
        {/if}
    {/key}
{/if}