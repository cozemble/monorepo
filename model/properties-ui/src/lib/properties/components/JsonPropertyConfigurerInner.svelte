<script lang="ts">
    import type {JsonProperty} from "@cozemble/model-core";
    import {writable} from "svelte/store";
    import {afterUpdate, onDestroy} from "svelte";
    import type {JsonSchema} from "@cozemble/model-core";
    import {JsonSchemaForm} from "@cozemble/frontend-json-schema-form";

    export let property: JsonProperty
    export let configSchema: JsonSchema

    const configuration = writable({...property.configuration})
    const unsub = configuration.subscribe((value) => {
        for (const key of Object.keys(property.configuration)) {
            delete property.configuration[key]
        }

        Object.assign(property.configuration, value)
    });
    onDestroy(unsub)

    afterUpdate(() => console.log({
        property,
        configSchema,
        configuration: $configuration
    }))
</script>

<JsonSchemaForm schema={configSchema} value={configuration}/>