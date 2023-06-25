<script lang="ts">

    import {parsedSchema} from "$lib/generative/parsedSchema";
    import {convertSchemaToModels, reconfigureApp} from "$lib/generative/components/helpers";
    import CommonDatabaseType from "$lib/generative/components/CommonDatabaseType.svelte";

    let value = ""
    let errorMessage: string | null = null
    let generating = false

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

    async function generate() {
        if (value.length < 3) {
            errorMessage = "Please enter a value that is at least 3 characters long"
        } else {
            generating = true
            errorMessage = null
            try {
                const fetched = await fetch("/", {
                    method: "POST",
                    body: JSON.stringify({databaseType: value}),
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }

                })
                if (!fetched.ok) {
                    throw new Error("Something went wrong, please try again")
                }
                const fetchedResponse = await fetched.json()
                const result = fetchedResponse.result
                if (!result) {
                    errorMessage = "Something went wrong, please try again"
                    return
                }
                const schema = parsedSchema(result)
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
            {#if generating}
                <span class="loading loading-spinner"></span>
            {/if}
            Generate
        </button>
        {#if generating}
            <p class="text-center mt-4">It can take up to 20 seconds for the AI to respond...</p>
        {/if}
        <p class="text-center mt-8"><em>Or start with a common database type</em></p>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 justify-items-center mx-auto">
            {#each commonDatabaseTypes as commonDatabaseType, index}
                <CommonDatabaseType {commonDatabaseType} {index} on:choice={onChoice}/>
            {/each}
        </div>
    </div>
</div>

