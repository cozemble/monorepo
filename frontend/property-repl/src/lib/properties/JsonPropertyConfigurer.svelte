<script lang="ts">
    import type {Model} from "@cozemble/model-core";
    import type {JsonProperty} from "$lib/properties/JsonProperty";
    import {propertyConfigurationSchemas} from "$lib/properties/JsonProperty";
    import {ObjectEditorWrapper} from "@cozemble/data-editor";
    import {writable} from "svelte/store";
    import type {JsonSchema} from "$lib/types/types";
    import {onDestroy} from "svelte";

    export let model: Model
    export let property: JsonProperty
    const configSchema: JsonSchema | null = propertyConfigurationSchemas.get(property.propertyType)

    const configuration = writable({...property.configuration})
    const errors = writable({})
    console.log({configSchema})
    const unsub = configuration.subscribe((value) => {
        console.log({value})
        for (const key of Object.keys(property.configuration)) {
            delete property.configuration[key];
        }

        Object.assign(property.configuration, value);
        console.log({property})
    });
    onDestroy(unsub)
</script>


<ObjectEditorWrapper
        schema={configSchema}
        title={'Options'}
        bind:value={$configuration}
        errors={$errors}/>