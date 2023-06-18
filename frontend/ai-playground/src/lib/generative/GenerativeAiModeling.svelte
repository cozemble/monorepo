<script lang="ts">
    import {promptManager} from "./GenerativeAiBackend"

    import ChatGPTInput from "./components/ChatGPTInput.svelte";
    import ChatGPTResult from "./components/ChatGPTResult.svelte";
    import TableDataset from "./components/TableDataset.svelte";
    import {registerJsonProperties} from "@cozemble/model-properties-core";
    import {parsedSchema} from "$lib/generative/parsedSchema";

    registerJsonProperties()

    let result = ''
    const handlePrompt = async (e: CustomEvent) => {
        result = (await promptManager(e.detail)) ?? ''
    }
</script>

<main>
    <div class="container mt-5">
        <div class="flex items-end">
            <ChatGPTInput on:handle-prompt={handlePrompt}/>
            <ChatGPTResult code={result}/>
        </div>

        {#if result.startsWith('{')}
            <div class="data-set">
                <TableDataset schema={parsedSchema(result)}/>
            </div>
        {/if}
    </div>
</main>

<style>
    .data-set {
        margin-top: 2em;
    }
</style>