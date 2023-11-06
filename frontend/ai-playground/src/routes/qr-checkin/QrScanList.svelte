<script lang="ts">
    import type {ImageWithQrCode} from "./types";

    export let foundImages: ImageWithQrCode[]
    export let deviceType: string
    let modal: HTMLDialogElement
    let exportFileName = ""
    let fileNameInput: HTMLInputElement
    let exportError: string


    function onExport() {
        modal.showModal()
        setTimeout(() => fileNameInput.focus(), 100)
    }

    function handleSubmit() {
        exportError = ""
        if (exportFileName.endsWith('.csv')) {
            const csvContent = "data:text/csv;charset=utf-8,Mac,Device Type\n" + foundImages.map(({code}) => `${code},${deviceType}`).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", exportFileName);
            document.body.appendChild(link); // Required for FF

            link.click();
            modal.close()
            exportFileName = ""
        } else {
            exportError = 'File name must end with .csv'
        }
    }

</script>

<div>
    <div class="flex mb-2">
        <h6 class="ml-1">Number of devices scanned: {foundImages.length}</h6>
        <button class="btn btn-primary btn-sm ml-2" on:click={onExport}>Export</button>
    </div>
    <table class="table border">
        <thead>
        <tr>
            <th>MAC</th>
            <th>QR code</th>
        </thead>
        <tbody>
        {#each foundImages as {code, image}}
            <tr>
                <td>{code}</td>
                <td><img src={image} alt="QR code image" width="100" height="100"/></td>
            </tr>
        {/each}
        </tbody>
    </table>
</div>

<dialog bind:this={modal} class="modal">
    <form method="dialog" class="modal-box" on:submit|preventDefault={handleSubmit}>
        <div class="mx-auto">
            <h1>Exporting</h1>
            <p>Enter the file name</p>
            <input type="text" bind:value={exportFileName} class="input input-bordered w-full"
                   bind:this={fileNameInput} pattern=".*\.csv$"
                   title="The file name must end with '.csv'."/><br/>
            {#if exportError}
                <p>{exportError}</p><br/>
            {/if}
            <div class="mt-2">
                <button class="btn btn-primary" type="submit">Export</button>
                <button class="btn btn-secondary" type="reset" on:click={() => modal.close()}>Cancel</button>
            </div>
        </div>
    </form>
</dialog>