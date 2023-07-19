<script lang="ts">
    import {modelRecordsContextFns, singleRecordEditContext} from "@cozemble/frontend-datatable";
    import {onMount} from "svelte";

    const rootRecordId = singleRecordEditContext.getRootRecordId()
    const records = modelRecordsContextFns.getRecords()
    let toggleButton: HTMLLabelElement;

    function close() {
        toggleButton.click();
    }

    onMount(() => {
        toggleButton.click()
    })
</script>

<label for="my-modal" class="btn invisible" bind:this={toggleButton}>open modal</label>

<input type="checkbox" id="my-modal" class="modal-toggle"/>
<div class="modal">
    <div class="modal-box">
        <h3 class="my-3">Speak your data</h3>
        <div class="mt-3">
            <button class="btn" on:click={close}>Close</button>
        </div>
    </div>
</div>
