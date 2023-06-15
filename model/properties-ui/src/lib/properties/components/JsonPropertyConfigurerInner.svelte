<script lang="ts">
    import type {JsonProperty} from "@cozemble/model-core";
    import {ObjectEditorWrapper} from "@cozemble/data-editor";
    import {writable} from "svelte/store";
    import {afterUpdate, onDestroy} from "svelte";
    import type {JsonSchema} from "@cozemble/model-core";

    export let property: JsonProperty
    export let configSchema: JsonSchema

    const configuration = writable({...property.configuration})
    const errors = writable({})
    const unsub = configuration.subscribe((value) => {
        for (const key of Object.keys(property.configuration)) {
            delete property.configuration[key];
        }

        Object.assign(property.configuration, value);
    });
    onDestroy(unsub)

    afterUpdate(() => console.log({
        property,
        configSchema,
        configuration: $configuration,
        errors: $errors,
    }))
</script>

<ObjectEditorWrapper
        schema={configSchema}
        title={'Options'}
        bind:value={$configuration}
        errors={$errors}/>