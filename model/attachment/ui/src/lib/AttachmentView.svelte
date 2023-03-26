<script lang="ts">
    import type {AttachmentReference} from "@cozemble/model-attachment-core";

    export let attachment:AttachmentReference
</script>
<img src={attachment.thumbnailUrl}/>

<style>
    img {
        width: 50%;
        height: 50%;
    }
</style>