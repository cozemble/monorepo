<script lang="ts">

    import {convertSchemaToModels, reconfigureApp} from "$lib/generative/components/helpers";
    import CommonDatabaseType from "$lib/generative/components/CommonDatabaseType.svelte";
    import type {JustErrorMessage, Value} from "@cozemble/lang-util";
    import {justErrorMessage} from "@cozemble/lang-util";
    import {setCurrentAiChatRequest} from "$lib/chat/ChatTypes";

    let value = ""
    let errorMessage: string | null = null

    const commonDatabaseTypes = [
        "Customers",
        "Clients",
        "Members",
        "Catering events",
        "Bookings",
        "Orders",
        "Products",
        "Suppliers",
        "Invoices",
        "Employees",
        "Assets",
        "Sales",
        "Purchases",
        "Projects",
        "Contracts",
        "Payments",
        "Support Tickets",
        "Services",
    ]

    function onChatResponse(response: JustErrorMessage | Value) {
        if(response._type === 'value') {
            const converted = convertSchemaToModels(response.value)
            reconfigureApp(converted)
        }
    }

    function looksLikeJsonSchema(json: any) {
        const looksOk = json && json.title && json.type && json.properties
        return looksOk ? null : justErrorMessage("Not a valid JSON Schema")
    }


    async function generate() {
        if (value.length < 3) {
            errorMessage = "Please enter a value that is at least 3 characters long"
        } else {
            errorMessage = null
            setCurrentAiChatRequest("/", {databaseType: value}, onChatResponse, looksLikeJsonSchema)
        }
    }

    function inputKeyDown(event: KeyboardEvent) {
        if (event.key === "Enter" && value.length >= 3) {
            generate()
        }
    }

    function init(element: HTMLInputElement) {
        element.focus()
    }

    function onChoice(event: CustomEvent) {
        value = event.detail.commonDatabaseType
        generate()
    }

</script>

<div class="grid h-screen place-items-center w-5/6 mx-auto mb-8">
    <div class="flex flex-col">
        <h1 class="text-center mb-8">I want a database that contains a list of ...</h1>
        <input type="text" class="input input-bordered input-lg" placeholder="some thing..." bind:value
               on:keydown={inputKeyDown} use:init/>
        {#if errorMessage}
            <p class="text-center text-red-500 mt-4">{errorMessage}</p>
        {/if}
        <button class="btn btn-primary mt-4 btn-lg" on:click={generate}>
            Generate
        </button>
        <p class="text-center mt-8"><em>Or start with a common database type</em></p>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 justify-items-center mx-auto">
            {#each commonDatabaseTypes as commonDatabaseType, index}
                <CommonDatabaseType {commonDatabaseType} {index} on:choice={onChoice}/>
            {/each}
        </div>
    </div>
</div>

