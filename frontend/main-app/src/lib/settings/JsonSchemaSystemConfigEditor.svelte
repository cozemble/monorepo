<script lang="ts">
    import type {JsonProperty, JsonPropertyDescriptor, SystemConfiguration} from "@cozemble/model-core";
    import {type Writable, writable} from "svelte/store";
    import {mandatory} from "@cozemble/lang-util";
    import {onDestroy} from "svelte";
    import {JsonSchemaForm} from "@cozemble/frontend-json-schema-form";

    export let propertyDescriptor: JsonPropertyDescriptor<JsonProperty, any>
    export let config: Writable<SystemConfiguration>
    const schema = mandatory(propertyDescriptor.systemConfigurationSchema, 'systemConfigurationSchema')

    const pdConfig = writable(($config as any)[propertyDescriptor.propertyType.value] ?? {});

    const unsub = pdConfig.subscribe((value) => {
        config.update((c) => {
            (c as any)[propertyDescriptor.propertyType.value] = value
            return c
        })
    });
    onDestroy(unsub)
</script>

<JsonSchemaForm {schema} value={pdConfig}/>
