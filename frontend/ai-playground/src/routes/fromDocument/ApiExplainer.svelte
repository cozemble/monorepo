<script lang="ts">
    let url = "https://api.cozemble.com/ocr-as-json"
    let apiKey = "98ysiudasdjhi8asdy89sad"
</script>

<h1 class="text-center">Your Document to JSON API</h1>
<p class="text-center mb-8"><em>Your API is ready.  Post documents to this URL with the supplied API key<br/>The API will perform OCR on the document, apply the post-OCR corrections your configured<br/>and convert the contents to the JSON schema</em></p>

<div class="flex flex-col">
    <div class="w-full">
        <label class="label">URL</label>
        <input type="text" bind:value={url} class="input input-bordered w-full" readonly/>
    </div>
    <div class="w-full">
        <label class="label">API Key</label>
        <input type="text" bind:value={apiKey} class="input input-bordered w-full" readonly/>
    </div>
    <button class="btn btn-primary mt-4 btn-lg">
        Finished
    </button>

</div>
