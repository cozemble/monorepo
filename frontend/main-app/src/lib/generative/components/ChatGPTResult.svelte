<script>
    import CodeMirror from 'svelte-codemirror-editor'
    import {javascript} from '@codemirror/lang-javascript'

    export let code = ''
</script>

<div class="mb-4">
    <CodeMirror 
        bind:value={code}
        lang={javascript()}
        styles={{
            "&": { height: "10rem" }
        }} />
    <button class="bg-blue-500 hover:bg-blue-700 text-white rounded font-bold py-2 mt-2 px-4 mt-5">Generate Model</button>
</div>