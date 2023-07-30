<script lang="ts">

    import {editorExtensions} from "$lib";
    import DictationPane from "./DictationPane.svelte";

    const modelPaneSwitch = editorExtensions.getSwitchableModelPane()

    function clicked() {
        modelPaneSwitch.set({component:DictationPane, props:{}})
    }
</script>
<button class="btn btn-ghost btn-active btn-sm  mr-2" on:click={clicked}>
    Dictate
</button>
