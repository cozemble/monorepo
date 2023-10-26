<script lang="ts">
    import type {ImageWithQrCode} from "./types";

    export let foundImages: ImageWithQrCode[]
</script>

<div class="flex flex-col">
    <div>
        <h6>Number of devices found: {foundImages.length}</h6>
    </div>
    <div class="flex flex-wrap">
        {#each foundImages as {code, image}}
            <div class="flex border flex-col mx-2 rounded p-2 mt-2">
                <h5>MAC: {code}</h5>
                <img src={image} alt="QR code image" width="100" height="100"/>
            </div>
        {/each}
    </div>
</div>