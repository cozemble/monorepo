<script lang="ts">

    import {editorExtensions} from "$lib";

    const modelPaneSwitch = editorExtensions.getSwitchableModelPane()

    function close() {
        modelPaneSwitch.set(null)
    }
</script>
<p>This is the dictation page</p>
<button class="btn btn-primary" on:click={close}>Close</button>