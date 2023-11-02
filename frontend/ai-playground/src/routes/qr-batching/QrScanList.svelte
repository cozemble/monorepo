<script lang="ts">
    import type {ImageWithQrCode} from "./types";

    export let foundImages: ImageWithQrCode[]
    export let deviceType:string

    function onExport() {
        const csvContent = "data:text/csv;charset=utf-8,Mac,Device Type\n" + foundImages.map(({code}) => `${code},${deviceType}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "qr-codes.csv");
        document.body.appendChild(link); // Required for FF

        link.click();
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