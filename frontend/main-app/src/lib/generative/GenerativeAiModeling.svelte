<script lang="ts">
    import { promptManager } from "./GenerativeAiBackend.js"

    import ChatGPTInput from "./components/ChatGPTInput.svelte";
    import ChatGPTResult from "./components/ChatGPTResult.svelte";
    import TableDataset from "./components/TableDataset.svelte";

    let result = ''
    const handlePrompt = async (e: CustomEvent) => {
        result = (await promptManager(e.detail)) ?? ''
    }
</script>

<main>
    <div class="container mt-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ChatGPTInput on:handle-prompt={handlePrompt} />
            <ChatGPTResult code={result} />
        </div>

        <!-- TableModel -->
        <div class="data-set">
            <!-- Quick display on of schema as table -->
            <TableDataset data={result} />
        </div>            
    </div>
</main>

<style>
    .data-set {
        margin-top: 2em;
    }
</style>