<script lang="ts">

    import {promptManager} from "$lib/generative/GenerativeAiBackend";
    import {parsedSchema} from "$lib/generative/parsedSchema";
    import {convertSchemaToModels, reconfigureApp} from "$lib/generative/components/helpers";
    import {onMount} from "svelte";
    import {registerJsonProperties} from "@cozemble/model-properties-core/dist/esm";
    import type {JsonSchema} from "@cozemble/model-core";

    let value = ""
    let errorMessage: string | null = null
    let generating = false

    async function generate() {
        if (value.length < 3) {
            errorMessage = "Please enter a value that is at least 3 characters long"
        } else {
            generating = true
            errorMessage = null
            try {
                const result = await promptManager(value) ?? null
                if (!result) {
                    errorMessage = "Something went wrong, please try again"
                    return
                }
                const schema = parsedSchema(result)
                console.log({schema})
                const converted = convertSchemaToModels(schema)
                reconfigureApp(converted)
            } catch (e: any) {
                errorMessage = e.message
            } finally {
                generating = false
            }
        }
    }

    function inputKeyDown(event: KeyboardEvent) {
        if (event.key === "Enter" && value.length >= 3) {
            generate()
        }
    }

    onMount(() => {
        registerJsonProperties()
        const schema:JsonSchema = {
            $schema: 'http://json-schema.org/draft-07/schema#',
            $id: 'test-customer-schema',
            title: 'Customer',
            pluralTitle: 'Customers',
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    unique: true,
                },
                firstName: {
                    type: 'string',
                },
                lastName: {
                    type: 'string',
                },
                email: {
                    type: 'string',
                    format: 'email',
                },
                phoneNumber: {
                    type: 'string',
                    format: 'phone',
                },
                address: {
                    type: 'object',
                    properties: {
                        street: {
                            type: 'string',
                        },
                        city: {
                            type: 'string',
                        },
                        state: {
                            type: 'string',
                        },
                        zipCode: {
                            type: 'string',
                        },
                    },
                    required: ['street', 'city', 'state', 'zipCode'],
                },
            },
            required: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
        }
        const converted = convertSchemaToModels(schema)
        reconfigureApp(converted)
    })
</script>

<div class="grid h-screen place-items-center">
    <div class="flex flex-col">
        <h1 class="text-center mb-8">I want a database that contains a list of ...</h1>
        <input type="text" class="input input-bordered input-lg" placeholder="some thing..." bind:value
               on:keydown={inputKeyDown}/>
        {#if errorMessage}
            <p class="text-center text-red-500 mt-4">{errorMessage}</p>
        {/if}
        <button class="btn btn-primary mt-4 btn-lg" disabled={value.length < 3} on:click={generate}>
            {#if generating}
                <span class="loading loading-spinner"></span>
            {/if}
            Generate
        </button>
        {#if generating}
            <p class="text-center mt-4">It can take up to 20 seconds for the AI to respond...</p>
        {/if}
    </div>
</div>