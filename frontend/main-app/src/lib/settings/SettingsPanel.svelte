<script lang="ts">
    import type {JsonProperty, JsonPropertyDescriptor} from "@cozemble/model-core";
    import {
        isJsonPropertyDescriptor,
        propertyDescriptors,
    } from "@cozemble/model-core";
    import {saveSystemConfiguration, systemConfiguration} from "../models/tenantEntityStore";
    import {writable} from "svelte/store";
    import ErrorMessage from "../util/ErrorMessage.svelte";
    import ThemeChange from "$lib/settings/ThemeChange.svelte";
    import {onMount} from "svelte";
    import JsonSchemaSystemConfigEditor from "$lib/settings/JsonSchemaSystemConfigEditor.svelte";

    export let tenantId: string;
    let error: string | null = null

    const writableSystemConfiguration = writable($systemConfiguration)
    let jsonPropertyDescriptorsWithSystemConfig = [] as JsonPropertyDescriptor<JsonProperty, any>[]

    async function save() {
        await saveSystemConfiguration(tenantId, $writableSystemConfiguration).catch(e => error = e.message)
    }

    onMount(() => {
        const pds = propertyDescriptors.list().filter(isJsonPropertyDescriptor) as JsonPropertyDescriptor<JsonProperty, any>[]
        jsonPropertyDescriptorsWithSystemConfig = pds.filter(pd => pd.systemConfigurationSchema)
    })

</script>

{#each jsonPropertyDescriptorsWithSystemConfig as pd}
    <div class="mt-3">
        <JsonSchemaSystemConfigEditor propertyDescriptor={pd} config={writableSystemConfiguration}/>
    </div>
{/each}

<div class="mt-3">
    <h2 class="font-bold text-xl text-primary capitalize">Theme</h2>

    <ThemeChange/>
</div>
<div class="mt-3">
    <button class="btn" on:click={save}>Save</button>
</div>

<ErrorMessage {error}/>