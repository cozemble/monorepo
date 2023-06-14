<script lang="ts">
    import type {JsonProperty, Model} from "@cozemble/model-core";
    import {propertyConfigurationSchemas} from "$lib/properties/JsonProperty";
    import {ObjectEditorWrapper} from "@cozemble/data-editor";
    import {writable} from "svelte/store";
    import {onDestroy} from "svelte";
    import {afterUpdate} from "svelte";

    export let model: Model
    export let property: JsonProperty
    $: configSchema = propertyConfigurationSchemas.get(property.propertyType)

    const configuration = writable({...property.configuration})
    const errors = writable({})
    const unsub = configuration.subscribe((value) => {
        for (const key of Object.keys(property.configuration)) {
            delete property.configuration[key];
        }

        Object.assign(property.configuration, value);
    });
    onDestroy(unsub)

    afterUpdate(() => console.log({property, configSchema, configuration:$configuration, errors:$errors}))
</script>

{#if configSchema}
    <ObjectEditorWrapper
            schema={configSchema}
            title={'Options'}
            bind:value={$configuration}
            errors={$errors}/>
{/if}