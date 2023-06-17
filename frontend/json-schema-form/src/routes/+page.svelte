<script lang="ts">
    import type {JsonSchema} from "@cozemble/model-core";
    import {writable} from "svelte/store";
    import JsonSchemaForm from "$lib/components/JsonSchemaForm.svelte";

    export const schema: JsonSchema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'https://cozemble.com/schemas/property/json/string',
        type: 'object',
        properties: {
            pattern: {
                type: 'string',
            },
            patternExplanation: {
                type: 'string',
            },
            multipleLines: {
                type: 'boolean',
                description: 'Whether the text can have multiple lines',
            },
            prefix: {
                type: 'string',
            },
            suffix: {
                type: 'string',
            },
        },
    }

    const value = writable({})


</script>
<div>
    <JsonSchemaForm schema={schema} bind:value={$value}/>
</div>
<div>
    <pre>{JSON.stringify($value, null, 2)}</pre>
</div>
