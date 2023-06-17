<script lang="ts">
    import type {JsonProperty, JsonPropertyDescriptor, SystemConfiguration} from "@cozemble/model-core";
    import {type Writable, writable} from "svelte/store";
    import {ObjectEditorWrapper} from "@cozemble/data-editor";
    import {mandatory} from "@cozemble/lang-util";
    import {onDestroy} from "svelte";

    export let propertyDescriptor: JsonPropertyDescriptor<JsonProperty, any>
    export let config: Writable<SystemConfiguration>
    const schema = mandatory(propertyDescriptor.systemConfigurationSchema, 'systemConfigurationSchema')

    const pdConfig = writable(($config as any)[propertyDescriptor.propertyType.value] ?? {});
    const errors = writable({})

    const unsub = pdConfig.subscribe((value) => {
        config.update((c) => {
            (c as any)[propertyDescriptor.propertyType.value] = value
            return c
        })
    });
    onDestroy(unsub)
</script>

<ObjectEditorWrapper
        {schema}
        title={propertyDescriptor.name.value}
        bind:value={$pdConfig}
        errors={$errors}/>