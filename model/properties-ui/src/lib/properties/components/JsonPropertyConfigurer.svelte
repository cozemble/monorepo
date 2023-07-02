<script lang="ts">
    import type {JsonProperty, JsonPropertyDescriptor} from "@cozemble/model-core";
    import {propertyDescriptors} from "@cozemble/model-core";
    import JsonPropertyConfigurerInner from "$lib/properties/components/JsonPropertyConfigurerInner.svelte";
    import {afterUpdate} from "svelte";
    import {DownCaret} from "@cozemble/ui-atoms";

    export let property: JsonProperty
    $: propertyDescriptor = propertyDescriptors.get(property.propertyType) as JsonPropertyDescriptor<JsonProperty, any>
    $: configSchema = propertyDescriptor?.configurationSchema

    afterUpdate(() => console.log("after update", property, propertyDescriptor, configSchema))

</script>

{#if configSchema}
    {#key property.propertyType.value}
        <div class="mt-2">
            <div class="collapse">
                <input type="checkbox" />
                <div class="collapse-title flex px-0">
                    <strong>More Options</strong> <div class="mt-1 ml-1"><DownCaret /></div>
                </div>
                <div class="collapse-content">
                    <JsonPropertyConfigurerInner {property} {configSchema}/>
                </div>
            </div>
        </div>
    {/key}
{/if}