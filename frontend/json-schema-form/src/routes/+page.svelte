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
                description: 'A regular expression that the text must match',
            },
            patternExplanation: {
                type: 'string',
                description: 'Text to display to the user if the text does not match the pattern',
            },
            multipleLines: {
                type: 'boolean',
                description: 'Whether the text can have multiple lines',
            },
            prefix: {
                type: 'string',
                description: 'A prefix to be displayed before the text',
            },
            suffix: {
                type: 'string',
                description: 'A suffix to be displayed after the text',
            },
            colour: {
                type: 'string',
                description: 'The colour of the text',
                enum: [
                    'black',
                    'blue',
                    'green',
                    'orange',
                    'purple',
                    'red',
                    'white',
                    'yellow',
                ],
            },
        },
    }

    const value = writable({})


</script>
<div>
    <JsonSchemaForm schema={schema} {value}/>
</div>
<div>
    <pre>{JSON.stringify($value, null, 2)}</pre>
</div>
